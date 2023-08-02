import * as React from 'react';
import {
    Column,
    Table,
    ExpandedState,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    ColumnDef,
    flexRender,
    ColumnFiltersState,
    getSortedRowModel,
    SortingState,
    FilterFn,
    getPaginationRowModel
} from "@tanstack/react-table";
import { RankingInfo, rankItem, compareItems } from "@tanstack/match-sorter-utils";
import { FaAngleDown, FaAngleUp, FaPrint, FaFileExcel, FaPaintBrush, FaEdit, FaSearch, FaSort, FaSortDown, FaSortUp, FaInfoCircle, FaChevronRight, FaChevronDown, FaChevronLeft, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { HTMLProps } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import { RiFileExcel2Fill } from 'react-icons/ri';
//import ShowTeamMembers from '../ShowTeamMember';

// ReactTable Part/////
declare module "@tanstack/table-core" {
    interface FilterFns {
        fuzzy: FilterFn<unknown>;
    }
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
        itemRank
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
};

///Global Filter Parts//////
// A debounced input react component
function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <>
            <div className="container-2 mx-1">
                <span className="icon"><FaSearch /></span>
                <input type="search" id="search" {...props}
                    value={value}
                    onChange={(e) => setValue(e.target.value)} />
            </div>
        </>
    );
}



export function Filter({
    column,
    table,
    placeholder
}: {
    column: Column<any, any>;
    table: Table<any>;
    placeholder: any
}): any {
    const columnFilterValue = column.getFilterValue();
    // style={{ width: placeholder?.size }}
    return (
        <input style={{ width: "100%" }} className="me-1 mb-1 mx-1 on-search-cross"
            // type="text"
            title={placeholder?.placeholder}
            type="search"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`${placeholder?.placeholder}`}
        // className="w-36 border shadow rounded"
        />
    );
}

export function IndeterminateCheckbox(
    {
        indeterminate,
        className = "",
        ...rest
    }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!);
    React.useEffect(() => {
        if (typeof indeterminate === "boolean") {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate]);
    return (
        <input
            type="checkbox"
            ref={ref}
            className={className + " cursor-pointer"}
            {...rest}
        />
    );
}

// ReactTable Part end/////

const GlobalCommanTable = (items: any) => {
    let expendedTrue = items?.expendedTrue
    let data = items?.data;
    let columns = items?.columns;
    let callBackData = items?.callBackData;
    let callBackDataToolTip = items?.callBackDataToolTip;
    let pageName = items?.pageName;
    let siteUrl: any = '';
    let showHeader = items?.showHeader;
    let showPagination: any = items?.showPagination;
    let usedFor: any = items?.usedFor;
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [ShowTeamPopup, setShowTeamPopup] = React.useState(false);
    const [showTeamMemberOnCheck, setShowTeamMemberOnCheck] = React.useState(false)
    const table: any = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        state: {
            globalFilter,
            columnFilters,
            expanded,
            sorting,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getSubRows: (row: any) => row?.subRows,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination === true ? getPaginationRowModel() : null,
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
        filterFromLeafRows: true,
        enableSubRowSelection: false,
        // filterFns: undefined
    });
    

    React.useEffect(() => {
        CheckDataPrepre()
    }, [table?.getSelectedRowModel()?.flatRows.length])
    React.useEffect(() => {

        if (items?.pageSize != undefined) {
            table.setPageSize(items?.pageSize)
        } else {
            table.setPageSize(100)
        }
        table.setPageSize(100)
    }, [])
    let item: any;
    let ComponentCopy: any = 0;
    let SubComponentCopy: any = 0;
    let FeatureCopy: any = 0;
    let FilterShowhideShwingData: any = false;
    let AfterSearch = table?.getRowModel()?.rows;
    React.useEffect(() => {
        if (AfterSearch != undefined && AfterSearch.length > 0) {
            AfterSearch?.map((Comp: any) => {
                if (Comp.columnFilters.Title == true || Comp.columnFilters.PortfolioStructureID == true || Comp.columnFilters.ClientCategory == true || Comp.columnFilters.TeamLeaderUser == true || Comp.columnFilters.PercentComplete == true || Comp.columnFilters.ItemRank == true || Comp.columnFilters.DueDate == true) {
                    FilterShowhideShwingData = true;
                }
                if (Comp.original != undefined) {
                    if (Comp?.original?.Item_x0020_Type == "Component") {
                        ComponentCopy = ComponentCopy + 1
                    }
                    if (Comp?.original?.Item_x0020_Type == "SubComponent") {
                        SubComponentCopy = SubComponentCopy + 1;
                    }
                    if (Comp?.original?.Item_x0020_Type == "Feature") {
                        FeatureCopy = FeatureCopy + 1;
                    }
                }
            })
        }
        let ShowingData = { ComponentCopy: ComponentCopy, SubComponentCopy: SubComponentCopy, FeatureCopy: FeatureCopy, FilterShowhideShwingData: FilterShowhideShwingData }
        callBackData(item, ShowingData)
    }, [table?.getRowModel()?.rows])

    const CheckDataPrepre = () => {
        if (usedFor == "SiteComposition") {
            let finalData: any = table?.getSelectedRowModel()?.flatRows;
            callBackData(finalData);
        } else {
            if (table?.getSelectedRowModel()?.flatRows.length > 0) {
                table?.getSelectedRowModel()?.flatRows?.map((elem: any) => {
                    elem.original.Id = elem.original.ID
                    item = elem.original;
                });
                callBackData(item)
            } else {
                callBackData(item)
            }
            console.log("itrm", item)
        }
    }
    const ShowTeamFunc = () => {
        setShowTeamPopup(true)
    }
    const showTaskTeamCAllBack = React.useCallback(() => {
        setShowTeamPopup(false)
    }, []);
    const openTaskAndPortfolioMulti = () => {
        table?.getSelectedRowModel()?.flatRows?.map((item: any) => {
            let siteUrl: any = ''
            if (item?.original?.siteUrl != undefined) {
                siteUrl = item?.original?.siteUrl;
            } else {
                siteUrl = items?.AllListId?.siteUrl;
            }
            if (item?.original?.siteType === "Master Tasks") {
                window.open(`${siteUrl}/SitePages/Portfolio-Profile.aspx?taskId=${item?.original?.Id}`, '_blank')
            } else if (item?.original?.siteType === "Project") {
                window.open(`${siteUrl}/SitePages/Project-Management.aspx?taskId=${item?.original?.Id}`, '_blank')
            } else {
                window.open(`${siteUrl}/SitePages/Task-Profile.aspx?taskId=${item?.original?.Id}&Site=${item?.original?.siteType}`, '_blank')
            }
        })
    }
    React.useEffect(() => {
        if (expendedTrue === false) {
            if (table.getState().columnFilters.length) {
                setExpanded(true);
            } else {
                setExpanded({});
            }
        }
    }, [table.getState().columnFilters]);


    React.useEffect(() => {
        if (expendedTrue === true) {
            setExpanded(true);
        } else {
            setExpanded({});
        }
    }, []);

    React.useEffect(() => {
        if (pageName === 'hierarchyPopperToolTip') {
            callBackDataToolTip(expanded);
        }
    }, [expanded])

    // Print ANd Xls Parts//////
    const downloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        autoTable(doc, {
            html: '#my-table'
        })
        doc.save('Data PrintOut');
    }
    // Export To Excel////////

    const exportToExcel = () => {
        const flattenedData: any[] = [];
        const flattenRowData = (row: any) => {
            const flattenedRow: any = {};
            columns.forEach((column: any) => {
                if (column.placeholder != undefined && column.placeholder != '') {
                    flattenedRow[column.id] = row.original[column.id];
                }
            });
            flattenedData.push(flattenedRow);
            if (row.getCanExpand()) {
                row.subRows.forEach(flattenRowData);
            }
        };
        table.getRowModel().rows.forEach(flattenRowData);
        const worksheet = XLSX.utils.aoa_to_sheet([]);
        XLSX.utils.sheet_add_json(worksheet, flattenedData, {
            skipHeader: false,
            origin: "A1",
        });
        const maxLength = 32767;
        const sheetRange = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let R = sheetRange.s.r; R <= sheetRange.e.r; ++R) {
            for (let C = sheetRange.s.c; C <= sheetRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];
                if (cell && cell.t === "s" && cell.v.length > maxLength) {
                    const chunks = [];
                    let text = cell.v;
                    while (text.length > maxLength) {
                        chunks.push(text.slice(0, maxLength));
                        text = text.slice(maxLength);
                    }
                    chunks.push(text);
                    cell.v = chunks.shift();
                    chunks.forEach((chunk) => {
                        const newCellAddress = XLSX.utils.encode_cell({
                            r: R + chunks.length,
                            c: C,
                        });
                        worksheet[newCellAddress] = { t: "s", v: chunk };
                    });
                }
            }
        }
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const excelData = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        if (typeof saveAs === "function") {
            saveAs(excelData, "table.xlsx");
        } else {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(excelData);
            downloadLink.download = "table.xlsx";
            downloadLink.click();
        }
    };

    ////Export to excel end/////
    return (
        <>
            {showHeader === true && <div className='tbl-headings justify-content-between mb-1'>
                <span className='leftsec'>
                    <span className='Header-Showing-Items'>{`Showing ${table?.getFilteredRowModel()?.rows?.length} out of ${data?.length}`}</span>
                    <DebouncedInput
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        placeholder="Search All..." />
                </span>
                <span className="toolbox">
                    {showTeamMemberOnCheck === true ? <span><a className="teamIcon" onClick={() => ShowTeamFunc()}><span title="Create Teams Group" className="svg__iconbox svg__icon--team teamIcon"></span></a>
                    </span> : <span><a className="teamIcon"><span title="Create Teams Group" style={{ backgroundColor: "gray" }} className="svg__iconbox svg__icon--team teamIcon"></span></a></span>}
                    {table?.getSelectedRowModel()?.rows?.length > 0 ? <span>
                        <a onClick={() => openTaskAndPortfolioMulti()} className="openWebIcon"><span className="svg__iconbox svg__icon--openWeb"></span></a>
                    </span> : <span><a className="openWebIcon"><span className="svg__iconbox svg__icon--openWeb" style={{ backgroundColor: "gray" }}></span></a></span>}
                    <a className='excal' onClick={() => exportToExcel()}><RiFileExcel2Fill/></a>

                    <a className='brush'><i className="fa fa-paint-brush hreflink" aria-hidden="true" title="Clear All" onClick={() => { setGlobalFilter(''); setColumnFilters([]); }}></i></a>


                    <a className='Prints' onClick={() => downloadPdf()}>
                        <i className="fa fa-print" aria-hidden="true" title="Print"></i>
                    </a>

                </span>
            </div>}

            <table className="SortingTable table table-hover mb-0" id='my-table' style={{ width: "100%" }}>
                <thead className='fixed-Header top-0'>
                    {table.getHeaderGroups().map((headerGroup: any) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header: any) => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan} style={header.column.columnDef.size != undefined && header.column.columnDef.size != 150 ? { width: header.column.columnDef.size + "px" } : {}}>
                                        {header.isPlaceholder ? null : (
                                            <div className='position-relative' style={{ display: "flex" }}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanFilter() ? (
                                                    // <span>
                                                    <Filter column={header.column} table={table} placeholder={header.column.columnDef} />
                                                    // </span>
                                                ) : null}
                                                {header.column.getCanSort() ? <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? "cursor-pointer select-none shorticon"
                                                            : "",
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {header.column.getIsSorted()
                                                        ? { asc: <FaSortDown />, desc: <FaSortUp /> }[
                                                        header.column.getIsSorted() as string
                                                        ] ?? null
                                                        : <FaSort />}
                                                </div> : ""}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table?.getRowModel()?.rows?.map((row: any) => {
                        return (
                            <tr className={pageName == 'ProjectOverviewGrouped' ? (row.original.Item_x0020_Type == "tasks" ? "a-bg" : "") : (row?.getIsExpanded() == true && row.original.Item_x0020_Type == "Component" ? "c-bg" : (row?.getIsExpanded() == true && row.original.Item_x0020_Type == "SubComponent" ? "s-bg" : (row?.getIsExpanded() == true && row.original.Item_x0020_Type == "Feature" ? "f-bg" : (row?.getIsExpanded() == true && row.original.SharewebTaskType?.Title == "Activities" ? "a-bg" : (row?.getIsExpanded() == true && row.original.SharewebTaskType?.Title == "Workstream" ? "w-bg" : "")))))}
                                key={row.id}>
                                {row.getVisibleCells().map((cell: any) => {
                                    return (
                                        <td key={cell.id}

                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                </tbody>
            </table>
            {showPagination === true && table?.getFilteredRowModel()?.rows?.length > table.getState().pagination.pageSize ? <div className="d-flex gap-2 items-center mb-3 mx-2">
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaAngleDoubleLeft />
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaChevronLeft />
                </button>
                <span className="flex items-center gap-1">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <FaChevronRight />
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    <FaAngleDoubleRight />
                </button>
                <select className='w-25'
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[20, 30, 40, 50, 60, 100, 150, 200].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div> : ''}
            {/* {ShowTeamPopup === true && items?.TaskUsers?.length > 0 ? <ShowTeamMembers props={table?.getSelectedRowModel()?.flatRows} callBack={showTaskTeamCAllBack} TaskUsers={items?.TaskUsers} /> : ''} */}

        </>
    )
}
export default GlobalCommanTable;