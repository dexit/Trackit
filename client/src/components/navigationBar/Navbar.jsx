import React, { useState } from "react";
import { FiLayers, FiFileText, FiUser, FiMenu } from "react-icons/fi";
import {
	Avatar,
	Button,
	Divider,
	Flex,
	Heading,
	IconButton,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Text,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import NavItem from "./NavItem";
import { useRouter } from "next/router";
import AuthService from "../../services/auth-service";
import UpdateUser from "../administration/UpdateUser";
import logo from "../../assests/Trackit_Plain.png";
import { Permissions } from "../../util/Utils";
import { usePermissions } from "../../hooks/usePermissions";
import Image from "next/image";
const Navbar = () => {
	const [navSize, setNavSize] = useState("large");
	const router = useRouter();
	const user = AuthService.getCurrentUser();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const canManageOtherUsers = usePermissions(Permissions.canUpdateUserProfile);
	const canManageCustomFields = usePermissions(Permissions.canManageRole);

	const menuItems = [
		// {
		// 	path: "/dashboard",
		// 	name: "Dashboard",
		// 	icon: FiHome,
		// },
		{
			path: "/projects",
			name: "Projects",
			icon: FiLayers,
		},
		{
			path: "/tickets",
			name: "Tickets",
			icon: FiFileText,
		},
		{
			path: "/administration",
			name: "Administration",
			icon: FiUser,
		},
	];

	const onProfileClick = () => {
		onOpen();
	};

	return (
		<>
			<Flex
				pos="sticky"
				h="100vh"
				direction="column"
				justifyContent="space-between"
				w={navSize === "small" ? "75px" : "250px"}
				background="secondary"
				boxShadow="xl"
			>
				<Flex
					p={5}
					direction="column"
					alignItems={navSize === "small" ? "center" : "flex-start"}
					as="nav"
				>
					<Image src={logo} alt="track it logo" />

					{menuItems.map((item, index) => {
						if (
							item.name === "Administration" &&
							!canManageOtherUsers &&
							!canManageCustomFields
						) {
							return <></>;
						}

						return (
							<NavItem
								key={index}
								navSize={navSize}
								icon={item.icon}
								name={item.name}
								path={item.path}
								active={
									router.pathname.includes(item.path) ||
									(item.path === "/projects" && router.pathname === "/")
								}
							/>
						);
					})}
				</Flex>

				<Flex p={5} direction="column" w="100%" alignItems="flex-start" mb={4}>
					<Divider
						borderColor="gray.300"
						display={navSize === "small" ? "none" : "flex"}
					/>

					<Menu matchWidth={true}>
						<MenuButton>
							<Flex mt={4} align="center" cursor="pointer">
								<Avatar size="sm" name={user.firstName + " " + user.lastName} />
								<Flex direction="column" ml={4} align="left">
									<Heading as="h3" size="xs">
										{user.firstName} {user.lastName}
									</Heading>
									<Text fontSize="sm">{user.roleId.name || "No Data"}</Text>
								</Flex>
							</Flex>
						</MenuButton>
						<MenuList>
							<MenuItem onClick={onProfileClick}>Profile</MenuItem>
							<MenuItem onClick={() => AuthService.logout()}>Logout</MenuItem>
						</MenuList>
					</Menu>
				</Flex>
			</Flex>

			<UpdateUser
				isOpen={isOpen}
				closeModal={onClose}
				viewUser={user}
				isUpdateMyProfile={true}
			/>
		</>
	);
};

export default Navbar;
