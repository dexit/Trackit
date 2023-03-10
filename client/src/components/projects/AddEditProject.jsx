import {
	Tabs,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Box,
	Alert,
	FormControl,
	FormLabel,
	FormErrorMessage,
	IconButton,
	Flex,
	Heading,
	Spacer,
	Textarea,
	Button,
	Input,
	useToast,
	useDisclosure,
	Center,
	Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Field, Form, Formik } from "formik";
import React, { useState, useEffect, useRef } from "react";
import {
	CreateProjectData,
	CreateProjectSchema,
} from "../../util/ValidationSchemas";
import { USERS_COLUMNS } from "../../util/TableDataDisplay";
import { useSelector } from "react-redux";
import ProjectService from "../../services/project-service";
import AlertModal from "../others/AlertModal";
import { getUsers } from "../../features/miscellaneousSlice.js";
import Table from "../others/Table";
import AuthService from "../../services/auth-service";
import { useRouter } from "next/router";
import PageNotFound from "@/pages/404";

const AddEditProject = ({ projectId }) => {
	const router = useRouter();
	const [isProjectAuthor, setisProjectAuthor] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const isNewProject = !projectId;
	const allUsers = useSelector(getUsers(true));
	const formRef = useRef();
	const toast = useToast();

	const [assigneesId, setAssigneesId] = useState([]);
	const [projectInfo, setProjectInfo] = useState(CreateProjectData);
	const [error, seterror] = useState("");
	const [isLoading, setisLoading] = useState(false);

	const [is404, setIs404] = useState(false);

	const getSelectedAssigneesId = () => {
		const selectedAssignees = {};

		projectInfo.assignees.forEach((assignee) => {
			selectedAssignees[assignee] = true;
		});

		return selectedAssignees;
	};

	const onAssigneeClick = ({ selected }) => {
		setAssigneesId(Object.keys(selected));
	};

	const onProjectDelete = async (onClose) => {
		try {
			await ProjectService.deleteProject(projectInfo._id);
			router.back();
			router.back();
		} catch (error) {
			seterror(error);
		}
		onClose();
	};

	const getProjectInfo = async () => {
		try {
			const {
				_id,
				title,
				description,
				assignees,
				authorId,
			} = await ProjectService.getProjectInfo(projectId);

			const isCurrentUserProjectAuthor =
				AuthService.getCurrentUser()._id === authorId._id;
			setisProjectAuthor(isCurrentUserProjectAuthor);
			setProjectInfo({
				_id,
				title,
				description,
				assignees,
			});
			setAssigneesId(assignees);
		} catch (error) {
			setIs404(true);
		}
	};

	const onHandleFormSubmit = async (values, _) => {
		values.assignees = assigneesId;

		try {
			if (projectId) {
				await ProjectService.updateProject(values);
			} else {
				await ProjectService.createProject(values);
			}

			toast({
				title: `Project ${projectId ? "Updated" : "Created"}`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			router.back();
		} catch (error) {
			seterror(error);
		}
	};
	useEffect(() => {
		if (projectId) {
			getProjectInfo();
		}
	}, []);

	if (is404) {
		return <PageNotFound />;
	}

	return (
		<Flex w="100%" h="100%" direction="column" padding={10}>
			<Flex w="100%" h="fit-content">
				<Heading as="h1" size="lg" fontWeight={600}>
					{projectId ? "Edit" : "Add"} Project
				</Heading>
				<Spacer />
				<IconButton
					icon={<CloseIcon />}
					variant="ghost"
					onClick={() => router.back()}
				/>
			</Flex>

			<Tabs variant="enclosed" size="sm" colorScheme="blue" mt={10}>
				<TabList>
					<Tab>Project Info</Tab>
					<Tab>Contributors</Tab>
				</TabList>

				<TabPanels maxHeight="100%" height="100%">
					<TabPanel>
						<Formik
							initialValues={projectInfo}
							validationSchema={CreateProjectSchema}
							onSubmit={onHandleFormSubmit}
							innerRef={formRef}
							enableReinitialize
						>
							{({ errors, touched }) => (
								<Flex direction="column" justify="space-between">
									<Form>
										<Box>
											{error && (
												<Alert
													status="error"
													variant="left-accent"
													mb={2}
													fontSize="sm"
												>
													{error}
												</Alert>
											)}
											<Flex direction="column" gap={3}>
												<FormControl isInvalid={errors.title && touched.title}>
													<FormLabel>Title</FormLabel>
													<Field
														as={Input}
														name="title"
														type="text"
														borderWidth="2px"
														disabled={!isNewProject && !isProjectAuthor}
													/>
													<FormErrorMessage>{errors.title}</FormErrorMessage>
												</FormControl>

												<FormControl
													isInvalid={errors.description && touched.description}
												>
													<FormLabel>Description</FormLabel>
													<Field
														as={Textarea}
														name="description"
														type="text"
														borderWidth="2px"
														disabled={!isNewProject && !isProjectAuthor}
													/>
													<FormErrorMessage>
														{errors.description}
													</FormErrorMessage>
												</FormControl>
											</Flex>
										</Box>
									</Form>
								</Flex>
							)}
						</Formik>
					</TabPanel>
					<TabPanel>
						<Table
							tableData={allUsers}
							columns={USERS_COLUMNS}
							searchPlaceholder={"Search for users"}
							height={390}
							hasCheckboxColumn={true}
							sortable={false}
							selectedRow={getSelectedAssigneesId()}
							onSelectionChange={onAssigneeClick}
							disableCheckBox={!isNewProject && !isProjectAuthor}
						/>
					</TabPanel>
				</TabPanels>
			</Tabs>

			<Flex mt={3} justify="flex-end" gap={3}>
				{isNewProject || isProjectAuthor ? (
					<Button
						colorScheme="blue"
						onClick={() => {
							formRef.current?.submitForm();
						}}
					>
						{projectId ? "Save" : "Create"}
					</Button>
				) : null}

				{projectId && isProjectAuthor ? (
					<Button colorScheme="red" onClick={() => onOpen()}>
						Delete
					</Button>
				) : (
					<Button onClick={() => router.back()}>Cancel</Button>
				)}
			</Flex>

			<AlertModal
				title={"Delete project"}
				body="Are you sure you to delete project?"
				isOpen={isOpen}
				onClose={onClose}
				onCTA={onProjectDelete}
			/>
		</Flex>
	);
};

export default AddEditProject;
