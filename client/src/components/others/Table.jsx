import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";

import { getFieldValue } from "../../util/GetObjectProperty";

const Table = ({
	tableData,
	columns,
	searchPlaceholder,
	searchbarVariant,
	onRowClick,
	defaultSortInfo,
	hasCheckboxColumn = false,
	sortable = true,
	selectedRow,
	onSelectionChange,
	height = 400,
}) => {
	const [dataSource, setDataSource] = useState(tableData || []);
	const gridStyle = { minHeight: height };
	const [dataFields, setDataFields] = useState([]);

	const getDataSourceFields = () => {
		const result = [];

		columns.forEach((column) => result.push(column.name));

		setDataFields(result);
	};

	const handleSearchInputChange = ({ target: { value } }) => {
		const lowerSearchText = value.toLowerCase();

		const newData = tableData.filter((data) => {
			return dataFields.some((key) => {
				const value = getFieldValue(data, key);
				return value.toLowerCase().includes(lowerSearchText);
			});
		});

		setDataSource(newData);
	};

	useEffect(() => {
		getDataSourceFields();
	}, []);

	return (
		<>
			<SearchBar
				placeholder={searchPlaceholder}
				variant={searchbarVariant}
				handleSearchInputChange={handleSearchInputChange}
			/>
			<br />
			<ReactDataGrid
				idProperty="_id"
				style={gridStyle}
				dataSource={dataSource}
				columns={columns}
				defaultSortInfo={defaultSortInfo}
				sortable={sortable}
				onRowClick={onRowClick}
				checkboxColumn={hasCheckboxColumn}
				checkboxOnlyRowSelect={hasCheckboxColumn}
				defaultSelected={selectedRow}
				onSelectionChange={onSelectionChange}
			/>
		</>
	);
};

export default Table;
