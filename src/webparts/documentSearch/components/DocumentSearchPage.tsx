import React, { useEffect, useState } from 'react'
import { Web } from 'sp-pnp-js';
import styles from './DocumentSearch.module.scss';
import GlobalCommanTable from '../../../GlobalCommon/GlobalCommanTable';
import { ColumnDef } from '@tanstack/react-table';
import DocumentPopup from './DocumentPopup';
import moment from 'moment';
var TaskUser: any = []
export default function DocumentSearchPage(Props: any) {
    //#region Required Varibale on Page load BY PB
    const PageContext = Props.Selectedprops;
    const [AllDocs, setAllDocs] = useState([]);
    const [selectedItemId, setSelectedItem] = useState(undefined);
    const [isEditModalOpen, setisEditModalOpen] = useState(false);
    //#endregion
    //#region code to load All Documents By PB
    const LoadDocs = () => {
        let web = new Web(PageContext.context._pageContext._web.absoluteUrl + '/')
        web.lists.getById(PageContext.DocumentListId).items.select('Id,Title,Year,File_x0020_Type,FileLeafRef,FSObjType,FileDirRef,Created,Modified,Author/Id,Author/Title,Editor/Id,Editor/Title,EncodedAbsUrl').filter('FSObjType eq 0').expand('Author,Editor').getAll()
            .then((response: any) => {
                try {
                    response.forEach((Doc: any) => {
                        Doc.Created = moment(Doc.Created).format('DD/MM/YYYY');
                        Doc.Modified = moment(Doc.Modified).format('DD/MM/YYYY HH:mm')
                        Doc.SiteIcon = PageContext.context._pageContext._web.title;
                        Doc.AllModifiedImages = [];
                        Doc.AllCreatedImages = [];
                        let CreatedUserObj: any = {};
                        let ModifiedUserObj: any = {};
                        TaskUser.forEach((User: any) => {
                            if (User.AssingedToUser != undefined && User.AssingedToUser.Id != undefined && Doc.Author.Id == User.AssingedToUser.Id && User.Item_x0020_Cover != undefined) {
                                CreatedUserObj['UserImage'] = User.Item_x0020_Cover.Url;
                                CreatedUserObj['Suffix'] = User.Suffix;
                                CreatedUserObj['Title'] = User.Title;
                                CreatedUserObj['UserId'] = User.AssingedToUserId;
                            }
                            else if (Doc.Author.Id == 9) {
                                CreatedUserObj['UserImage'] = PageContext.context._pageContext._web.serverRelativeUrl + '/PublishingImages/Portraits/portrait_Stefan.jpg';
                                CreatedUserObj['Suffix'] = '';
                                CreatedUserObj['Title'] = 'Stefan Hochhuth'
                                CreatedUserObj['UserId'] = 32
                            }

                            if (User.AssingedToUser != undefined && User.AssingedToUser.Id != undefined && Doc.Editor.Id == User.AssingedToUser.Id && User.Item_x0020_Cover != undefined) {
                                ModifiedUserObj['UserImage'] = User.Item_x0020_Cover.Url;
                                ModifiedUserObj['Suffix'] = User.Suffix;
                                ModifiedUserObj['Title'] = User.Title;
                                ModifiedUserObj['UserId'] = User.AssingedToUserId;
                            }
                            else if (Doc.Editor.Id == 9) {
                                ModifiedUserObj['UserImage'] = PageContext.context._pageContext._web.serverRelativeUrl + '/PublishingImages/Portraits/portrait_Stefan.jpg';
                                ModifiedUserObj['Suffix'] = '';
                                ModifiedUserObj['Title'] = 'Stefan Hochhuth'
                                ModifiedUserObj['UserId'] = 32
                            }
                        });
                        Doc.AllCreatedImages.push(CreatedUserObj);
                        Doc.AllModifiedImages.push(ModifiedUserObj)
                    });
                } catch (e) {
                    console.log(e)
                }
                setAllDocs(response);
            }).catch((error: any) => {
                console.error(error);
            });
    }
    //#endregion
    //#region code to load TaskUser By PB
    const LoadTaskUser = () => {
        let web = new Web(PageContext.context._pageContext._web.absoluteUrl + '/')
        web.lists.getById(PageContext.TaskUserListId).items.select('Id,Suffix,Title,SortOrder,Item_x0020_Cover,AssingedToUserId,AssingedToUser/Title,AssingedToUser/Id,AssingedToUser/EMail,ItemType').expand('AssingedToUser').getAll().then((response: any) => {
            TaskUser = response;
            LoadDocs();
        }).catch((error: any) => {
            console.error(error);
        });
    }
    useEffect(() => {
        LoadTaskUser()
    }, []);
    //#endregion
    //#region code to edit delete and callback function BY PB
    const closeEditPopup = () => {
        setisEditModalOpen(false)
        LoadDocs();
    }
    const EditItem = (itemId: any) => {
        setisEditModalOpen(true)
        setSelectedItem(itemId)
    }
    const deleteData = (dlData: any) => {
        var flag: any = confirm('Do you want to delete this item')
        if (flag) {
            let web = new Web(PageContext.context._pageContext._web.absoluteUrl + '/')
            web.lists.getById(PageContext.DocumentListId).items.getById(dlData.Id).recycle().then(() => {
                alert("delete successfully")
                LoadDocs();
            }).catch((error: any) => {
                console.error(error);
            });
        }
    }
    //#endregion 
    //#region code to apply react/10stack global table BY PB
    const columns = React.useMemo<ColumnDef<any, unknown>[]>(() =>
        [{
            accessorKey: '',
            canSort: false,
            placeholder: '',
            header: '',
            size: 15,
            id: 'row.original',
            cell: ({ row }) => (
                <>
                    {row?.original?.SiteIcon}
                </>
            ),
        },
        {
            accessorKey: "Title", placeholder: "Title", header: "", size: 30,
            cell: ({ row }) => (
                <>
                    <a target="_blank" href={row?.original?.FileDirRef}>
                        <img src="/_layouts/15/images/folder.gif"></img>
                    </a>
                    {row?.original?.Title != undefined && row?.original?.Title != null && row?.original?.Title != '' ? <a target="_blank" href={row?.original?.FileDirRef}>{row?.original?.Title}</a> : <a target="_blank" href={row?.original?.FileDirRef}>{row?.original?.FileLeafRef}</a>}
                </>
            ),
        },
        {
            accessorKey: "FileLeafRef", placeholder: "Document Url", header: "", size: 25,
            cell: ({ row }) => (
                <>
                    <a>
                        {row?.original?.File_x0020_Type == 'pdf' &&
                            <img src={`${PageContext.context._pageContext._web.serverRelativeUrl}/SiteCollectionImages/ICONS/24/icon_pdf_16.jpg`}></img>}

                        {row?.original?.File_x0020_Type != 'flv' && row?.original?.File_x0020_Type != 'js' && row?.original?.File_x0020_Type != 'css' && row?.original?.File_x0020_Type != 'zip' && row?.original?.File_x0020_Type != 'aspx' && row?.original?.File_x0020_Type != 'mp4' && row?.original?.File_x0020_Type != 'pdf' && row?.original?.File_x0020_Type != 'jpg' && row?.original?.File_x0020_Type != 'png' && row?.original?.File_x0020_Type != 'gif' &&
                            <img src={`/_layouts/15/images/ic${row?.original?.File_x0020_Type}.png`}></img>}

                        {row?.original?.File_x0020_Type == 'flv' || row?.original?.File_x0020_Type == 'js' || row?.original?.File_x0020_Type == 'css' || row?.original?.File_x0020_Type == 'zip' || row?.original?.File_x0020_Type == 'aspx' || row?.original?.File_x0020_Type == 'mp4' || row?.original?.File_x0020_Type == 'jpg' || row?.original?.File_x0020_Type == 'png' || row?.original?.File_x0020_Type == 'gif' &&
                            <img src="/_layouts/15/images/icgen.gif?rev=23"></img>}
                    </a>
                    <a target="_blank" href={`${row?.original?.EncodedAbsUrl}?web=1`}>{row?.original?.FileLeafRef}</a>
                </>
            ),
        },
        {
            accessorKey: "Created", placeholder: "Created Date", header: "", size: 20,
            cell: ({ row }) => (
                <>
                    {/* {row?.original?.AllCreatedImages.map((item: any) => (
                        <a target="_blank" href={`${PageContext.context._pageContext._web.serverRelativeUrl}/SitePages/TeamLeader-Dashboard.aspx?UserId=${item.UserId}&Name=${item.Title}`}>
                            {row?.original?.Created} {item?.UserImage != undefined && item?.UserImage != '' ? <img title={item?.Title} className={styles.imgRound} src={item?.UserImage}></img> : <img title={item?.Title} className={styles.imgRound} src={`${PageContext.context._pageContext._web.serverRelativeUrl}/SiteCollectionImages/ICONS/32/icon_user.jpg`}></img>}
                        </a>
                    ))} */}
                </>
            ),
        },
        {
            accessorKey: "Modified", placeholder: "Modified Date", header: "", size: 20,
            cell: ({ row }) => (
                <>
                    {/* {row?.original?.AllModifiedImages.map((item: any) => (
                        <a target="_blank" href={`${PageContext.context._pageContext._web.serverRelativeUrl}/SitePages/TeamLeader-Dashboard.aspx?UserId=${item.UserId}&Name=${item.Title}`}>
                            {row?.original?.Modified} {item?.UserImage != undefined && item?.UserImage != '' ? <img title={item?.Title} className={styles.imgRound} src={item?.UserImage}></img> : <img title={item?.Title} className={styles.imgRound} src={`${PageContext.context._pageContext._web.serverRelativeUrl}/SiteCollectionImages/ICONS/32/icon_user.jpg`}></img>}
                        </a>
                    ))} */}
                </>
            ),
        },
        {
            cell: ({ row }) => (
                <>
                    <a onClick={() => EditItem(row.original.Id)} title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 21.9323V35.8647H13.3613H19.7226V34.7589V33.6532H14.3458H8.96915L9.0264 25.0837L9.08387 16.5142H24H38.9161L38.983 17.5647L39.0499 18.6151H40.025H41V13.3076V8H24H7V21.9323ZM38.9789 12.2586L39.0418 14.4164L24.0627 14.3596L9.08387 14.3027L9.0196 12.4415C8.98428 11.4178 9.006 10.4468 9.06808 10.2838C9.1613 10.0392 11.7819 9.99719 24.0485 10.0441L38.9161 10.1009L38.9789 12.2586ZM36.5162 21.1565C35.8618 21.3916 34.1728 22.9571 29.569 27.5964L23.4863 33.7259L22.7413 36.8408C22.3316 38.554 22.0056 39.9751 22.017 39.9988C22.0287 40.0225 23.4172 39.6938 25.1029 39.2686L28.1677 38.4952L34.1678 32.4806C41.2825 25.3484 41.5773 24.8948 40.5639 22.6435C40.2384 21.9204 39.9151 21.5944 39.1978 21.2662C38.0876 20.7583 37.6719 20.7414 36.5162 21.1565ZM38.5261 23.3145C39.2381 24.2422 39.2362 24.2447 32.9848 30.562C27.3783 36.2276 26.8521 36.6999 25.9031 36.9189C25.3394 37.0489 24.8467 37.1239 24.8085 37.0852C24.7702 37.0467 24.8511 36.5821 24.9884 36.0529C25.2067 35.2105 25.9797 34.3405 31.1979 29.0644C35.9869 24.2225 37.2718 23.0381 37.7362 23.0381C38.0541 23.0381 38.4094 23.1626 38.5261 23.3145Z" fill="#333333"></path></svg></a>
                </>
            ),
            accessorKey: '',
            canSort: false,
            placeholder: '',
            header: '',
            id: 'row.original',
            size: 20,
        },
        {
            cell: ({ row }) => (
                <>
                    <a onClick={() => deleteData(row.original)}><svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.3584 5.28375C18.4262 5.83254 18.1984 6.45859 18.1891 8.49582L18.1837 9.66172H13.5918H9V10.8591V12.0565H10.1612H11.3225L11.3551 26.3309L11.3878 40.6052L11.6525 41.1094C11.9859 41.7441 12.5764 42.3203 13.2857 42.7028L13.8367 43H23.9388C33.9989 43 34.0431 42.9989 34.6068 42.7306C35.478 42.316 36.1367 41.6314 36.4233 40.8428C36.6697 40.1649 36.6735 39.944 36.6735 26.1055V12.0565H37.8367H39V10.8591V9.66172H34.4082H29.8163L29.8134 8.49582C29.8118 7.85452 29.7618 7.11427 29.7024 6.85084C29.5542 6.19302 29.1114 5.56596 28.5773 5.2569C28.1503 5.00999 27.9409 4.99826 23.9833 5.00015C19.9184 5.0023 19.8273 5.00784 19.3584 5.28375ZM27.4898 8.46431V9.66172H24H20.5102V8.46431V7.26691H24H27.4898V8.46431ZM34.4409 25.9527C34.4055 40.9816 34.4409 40.2167 33.7662 40.5332C33.3348 40.7355 14.6335 40.7206 14.2007 40.5176C13.4996 40.1889 13.5306 40.8675 13.5306 25.8645V12.0565H24.0021H34.4736L34.4409 25.9527ZM18.1837 26.3624V35.8786H19.3469H20.5102V26.3624V16.8461H19.3469H18.1837V26.3624ZM22.8367 26.3624V35.8786H24H25.1633V26.3624V16.8461H24H22.8367V26.3624ZM27.4898 26.3624V35.8786H28.6531H29.8163V26.3624V16.8461H28.6531H27.4898V26.3624Z" fill="#333333"></path></svg></a>
                </>
            ),
            accessorKey: '',
            canSort: false,
            placeholder: '',
            header: '',
            id: 'row.original',
            size: 20,
        }
        ],
        [AllDocs]);
    const callBackData = React.useCallback((elem: any, getSelectedRowModel: any, ShowingData: any) => { }, []);
    //#endregion
    return (
        //#Jsx Part By PB
        <> {AllDocs && <div>
            <GlobalCommanTable columns={columns} data={AllDocs} showHeader={true} callBackData={callBackData} />
        </div>}
            {isEditModalOpen ? <DocumentPopup closeEditPopup={closeEditPopup} pagecontext={PageContext} Id={selectedItemId} /> : ''}
        </>
        //#endregion
    )
}


