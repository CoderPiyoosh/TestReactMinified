import "bootstrap/js/dist/tab.js";
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Web } from 'sp-pnp-js';
import { Panel, PanelType } from 'office-ui-fabric-react';
import moment from 'moment';
// var AllComponentItem: any[] = [];
// var AllServiceItem: any[] = [];
const DocumentPopup = (props: any) => {
    //#region Required Varibale on Page load BY PB
    const PageContext = props.pagecontext;
    const [UpdatedItem, setUpdatedItem]:any = useState({})
    const SharewebItemRank: any = [{ rankTitle: '(8) Top Highlights', rank: '8' }, { rankTitle: '(7) Featured Item', rank: '7' }, { rankTitle: '(6) Key Item', rank: '6' }, { rankTitle: '(5) Relevant Item', rank: '5' }, { rankTitle: '(4) Background Item', rank: '4' }, { rankTitle: '(2) to be verified', rank: '2' }, { rankTitle: '(1) Archive', rank: '1' }, { rankTitle: '(0) No Show', rank: '0' }];

    const [display, setDisplay] = useState(false);
    const [AllComponent, setAllComponent] = useState([]);
    const [search, setSearch] = useState("");
    //#endregion
    //#region code to load component/service item by PB
    const generateHierarchichalData = (item: any, items: any) => {
        var autoCompleteItem: any = {};
        autoCompleteItem['value'] = item.Title;
        autoCompleteItem['Title'] = item.Title;
        autoCompleteItem['Id'] = item.Id;
        autoCompleteItem['ID'] = item.Id;
        autoCompleteItem['description'] = item.Description1;
        autoCompleteItem['TaxType'] = item.TaxType;
        if (item.SiteType != undefined)
            autoCompleteItem['SiteType'] = item.SiteType
        autoCompleteItem['label'] = item.Title;
        items.forEach((parentItem: any) => {
            if (item.ParentID == parentItem.Id) {
                autoCompleteItem['label'] = parentItem.Title + ' > ' + item.Title;
                if (parentItem.ParentID > 0) {
                    items.forEach((gParentItem: any) => {
                        if (parentItem.ParentID == gParentItem.Id) {
                            autoCompleteItem['label'] = gParentItem.Title + ' > ' + autoCompleteItem.label;
                            if (gParentItem.ParentID > 0) {
                                items.forEach((mParentItem: any) => {
                                    if (gParentItem.ParentID == mParentItem.Id) {
                                        autoCompleteItem['label'] = mParentItem.Title + ' > ' + autoCompleteItem.label;
                                        return false;
                                    }
                                });
                            }
                        }
                    });
                }
                return false;
            }
        });
        return autoCompleteItem;
    }
    const loadComponentsData = (Type: any) => {
        var AllComponentItem: any[] = []
        let web = new Web(PageContext.context._pageContext._web.absoluteUrl + '/')
        web.lists.getById(PageContext.MasterTaskListId).items.select('ComponentCategory/Id,Portfolio_x0020_Type,ComponentCategory/Title,Id,ValueAdded,Idea,Sitestagging,TechnicalExplanations,Short_x0020_Description_x0020_On,Short_x0020_Description_x0020__x,Short_x0020_description_x0020__x0,Admin_x0020_Notes,Background,Help_x0020_Information,Item_x0020_Type,Title,Parent/Id,Parent/Title').expand('Parent,ComponentCategory').filter(`Portfolio_x0020_Type eq '${Type}'`).getAll()
            .then((response: any) => {
                try {
                    response.forEach((item: any) => {
                        item['siteType'] = 'Master Tasks';
                        item['select'] = false;
                        if (item.Parent != undefined && item.Parent.Id != undefined)
                            item['ParentID'] = item.Parent.Id;
                        item['TaxType'] = 'Components';
                        item = generateHierarchichalData(item, response)
                        AllComponentItem.push(item)
                        // if (item.Portfolio_x0020_Type == 'Component') {
                        //     AllComponentItem.push(item);
                        // }
                        // else if (item.Portfolio_x0020_Type == 'Service') {
                        //     AllServiceItem.push(item);
                        // }
                    })
                    setAllComponent(AllComponentItem)
                } catch (e) {
                    console.log(e)

                }

            }).catch((error: any) => {
                console.error(error);
            });

    }
    //#endregion
    //#region code to load All Documents By PB
    const isitemExists = function (TaskItems: any, Id: any) {
        var isExists = false;
        TaskItems.forEach((item: any) => {
            if (item.Id == Id) {
                isExists = true;
                return false;
            }
        });
        return isExists;
    }
    const IsTaskExists = function (arr: any, Id: any, siteType: any) {
        var isExists = false;
        arr.forEach((item: any) => {
            if (item.siteType != undefined && item.siteType != '' && item.Id == Id && item.siteType == siteType) {
                isExists = true;
                return false;
            }
        });
        return isExists;
    }
    const LoadDocItem = () => {
        let web = new Web(PageContext.context._pageContext._web.absoluteUrl + '/')
        web.lists.getById(PageContext.DocumentListId).items.select('Id,Url,Title,ItemRank,FileDirRef,FileLeafRef,File_x0020_Type,Year,EncodedAbsUrl,Created, Modified,Author/Name,Author/Title,Editor/Name,File/Name,Editor/Title,Gender/Id,Gender/Title,HHHH/Id,HHHH/Title,DE/Id,DE/Title,EI/Id,EI/Title,EPS/Id,EPS/Title,Education/Id,Education/Title,Shareweb/Id,Shareweb/Title,SharewebTask/Id,SharewebTask/Title').filter('Id eq ' + props.Id).expand('Author,SharewebTask,DE,EI,EPS,Education,Shareweb,Gender,HHHH,Editor,Author,Editor,File').getAll()
            .then((response: any) => {
                let FirstOjb = response[0];
                try {
                    web.lists.getById(PageContext.DocumentListId).items.select('Id,Title,Foundation/Id,Foundation/Title,QA/Id,QA/Title,Health/Id,Health/Title,Gruene/Id,Gruene/Title,OffShoreTask/Id,OffShoreTask/Id,OffShoreTask/Title').filter('Id eq ' + props.Id).expand('Foundation,QA,OffShoreTask,Health,Gruene').getAll()
                        .then((response: any) => {
                            try {
                                let SecondOjb = response[0];
                                let finalObj = { ...FirstOjb, ...SecondOjb }
                                finalObj.FileReafPartialName = finalObj.FileLeafRef.substr(0, finalObj.FileLeafRef.lastIndexOf('.'));
                                finalObj.fileType = finalObj.FileLeafRef.substr(finalObj.FileLeafRef.lastIndexOf('.'));
                                finalObj.AllRelevantTasks = [];
                                finalObj.TaggedComponent = [];
                                finalObj.serviceComponent = [];
                                finalObj.smartComponent = [];
                                if (finalObj.HHHH != undefined && finalObj.HHHH.length > 0) {
                                    finalObj.HHHH.forEach((data: any) => {
                                        data.siteType = 'HHHH';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.DE != undefined && finalObj.DE.length > 0) {
                                    finalObj.DE.forEach((data: any) => {
                                        data.siteType = 'DE';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Task != undefined && finalObj.Task.length > 0) {
                                    finalObj.Task.forEach((data: any) => {
                                        data.siteType = 'Tasks';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.smartComponent.push(data);
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                        }
                                    })
                                }
                                if (finalObj.EI != undefined && finalObj.EI.length > 0) {
                                    finalObj.EI.forEach((data: any) => {
                                        data.siteType = 'EI';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Shareweb != undefined && finalObj.Shareweb.length > 0) {
                                    finalObj.Shareweb.forEach((data: any) => {
                                        data.siteType = 'Shareweb';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Education != undefined && finalObj.Education.length > 0) {
                                    finalObj.Education.forEach((data: any) => {
                                        data.siteType = 'Education';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }

                                    })
                                }
                                if (finalObj.EPS != undefined && finalObj.EPS.length > 0) {
                                    finalObj.EPS.forEach((data: any) => {
                                        data.siteType = 'EPS';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Foundation != undefined && finalObj.Foundation.length > 0) {
                                    finalObj.Foundation.forEach((data: any) => {
                                        data.siteType = 'Foundation';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Gender != undefined && finalObj.Gender.length > 0) {
                                    finalObj.Gender.forEach((data: any) => {
                                        data.siteType = 'Gender';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Health != undefined && finalObj.Health.length > 0) {
                                    finalObj.Health.forEach((data: any) => {
                                        data.siteType = 'Health';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.Gruene != undefined && finalObj.Gruene.length > 0) {
                                    finalObj.Gruene.forEach((data: any) => {
                                        data.siteType = 'Gruene';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);

                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.QA != undefined && finalObj.QA.length > 0) {
                                    finalObj.QA.forEach((data: any) => {
                                        data.siteType = 'QA';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                if (finalObj.SharewebTask != undefined && finalObj.SharewebTask.length > 0) {
                                    finalObj.SharewebTask.forEach((data: any) => {
                                        finalObj.TaggedComponent.push(data);
                                        if (data.PortfolioType == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.PortfolioType != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                        }
                                    })
                                }
                                if (finalObj.OffShoreTask != undefined && finalObj.OffShoreTask.length > 0) {
                                    finalObj.OffShoreTask.forEach((data: any) => {
                                        data.siteType = 'OffShoreTask';
                                        if (!IsTaskExists(finalObj.AllRelevantTasks, data.Id, data.siteType))
                                            finalObj.AllRelevantTasks.push(data);
                                        finalObj.TaggedComponent.push(data);
                                        if (data.Portfolio_x0020_Type == 'Service' && (!isitemExists(finalObj.serviceComponent, data.Id))) {
                                            finalObj.serviceComponent.push(data);
                                            finalObj.PortfolioTypes = 'Services';
                                            finalObj.PortfoliosID = 'txtServiceSharewebComponentPopup';
                                        }
                                        else if (data.Portfolio_x0020_Type != undefined && data.Portfolio_x0020_Type != 'Service' && (!isitemExists(finalObj.smartComponent, data.Id))) {
                                            finalObj.PortfolioTypes = 'Component';
                                            finalObj.PortfoliosID = 'txtSharewebComponentPopup';
                                            finalObj.smartComponent.push(data);
                                        }
                                    })
                                }
                                finalObj.ItemRank = finalObj.ItemRank != undefined ? finalObj.ItemRank.toString() : '';
                                finalObj.filetype = finalObj.FileLeafRef.substr(finalObj.FileLeafRef.lastIndexOf('.'));
                                finalObj.Created = moment(finalObj.Created).format('DD/MM/YYYY HH:mm');
                                finalObj.Modified = moment(finalObj.Modified).format('DD/MM/YYYY hh:mm:ss');
                                setUpdatedItem({ ...finalObj })
                                //  loadComponentsData();
                                // setSelectedValue(finalObj.ItemRank);
                            } catch (e) {
                                console.log(e)
                            }

                        }).catch((error: any) => {
                            console.error(error);
                        });
                } catch (e) {
                    console.log(e)
                }

            }).catch((error: any) => {
                console.error(error);
            });
    }
    useEffect(() => {
        LoadDocItem()
    }, []);
    //#endregion
    const removeAllRelevantTasks = function (taskId: any) {
        UpdatedItem.AllRelevantTasks.forEach((item: any, index: any) => {
            if (item.Id != undefined && item.Id == taskId) {
                UpdatedItem.AllRelevantTasks.splice(index, 1);
            }
        })
        setUpdatedItem({ ...UpdatedItem });
        // let result= UpdatedItem.AllRelevantTasks.filter((item:any)=>{
        //     item.Id!=taskId
        // });
        // setUpdatedItem({
        //     ...UpdatedItem,
        //     AllRelevantTasks:result
        // });
    }
    const closePopup = () => {
        props.closeEditPopup()
    };
    const UpdateItem = () => {
        const updateDataValue = {
            RankItem: UpdatedItem.ItemRank,
            Title: UpdatedItem.Title,
            bekf: UpdatedItem.bekf,
            Location: UpdatedItem.Location,
        };
        let web = new Web('https://hhhhteams.sharepoint.com/sites/HHHH/SP/')
        web.lists.getByTitle("TestAppList").items.getById(props.item.Id).update(updateDataValue).then((response: any) => {
            alert("Update successful")
            props.closeEditPopup()
        }).catch((error: any) => {
            console.error(error);
        });
    }
    function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
        UpdatedItem.ItemRank = event.target.value;
        setUpdatedItem({ ...UpdatedItem });
    }
    const openPopupSmartTaxanomy = function () {
        if (UpdatedItem.selectedValue != undefined && UpdatedItem.selectedValue != '') {
            if (UpdatedItem.selectedValue == 'Component') {

            } else if (UpdatedItem.selectedValue == 'Services') {

            }
        } else {
            alert('Please select anyone from Portfolio/Services');
        }
    }
    const removeServiceComponent = function () {
        UpdatedItem.serviceComponent = undefined
        setUpdatedItem({ ...UpdatedItem });
    }
    const removeSmartComponent = function () {
        UpdatedItem.smartComponent = undefined
        setUpdatedItem({ ...UpdatedItem });
    }
    const onchangeValue = (event: any) => {
        UpdatedItem.selectedValue = event
        if (UpdatedItem.selectedValue == 'Component') {
            loadComponentsData('Component')
        } else if (UpdatedItem.selectedValue == 'Services') {
            loadComponentsData('Service')
        }
        setUpdatedItem({ ...UpdatedItem })
    }
    const openSmartTaxonomyPopup = (type: any) => {
        console.log('hi')
    }
    const removeSmartDocumentType = (Id: any) => {
        console.log('hi')
    }
    const removeItem = (Id: any) => {

    }
    const DownToUp = () => {
        UpdatedItem.FileReafPartialName = UpdatedItem.Title;
    }
    const UpToDown = () => {
        UpdatedItem.Title = UpdatedItem.FileReafPartialName;
    }
    const updateSelectItem = (selectedItem: any) => {
        if (UpdatedItem.selectedValue == 'Component') {
            UpdatedItem.smartComponent = []
            UpdatedItem.smartComponent.push(selectedItem)
        } else if (UpdatedItem.selectedValue == 'Services') {
            UpdatedItem.serviceComponent = []
            UpdatedItem.serviceComponent.push(selectedItem)
        }
        setDisplay(false);
    };
    const Update1 = (search: any) => {
        setSearch(search);
        if (search != undefined && search != '')
            setDisplay(true);
        else
            setDisplay(false);
    };

    return (
        <Panel
                title="popup-title"
                isOpen={true}
                onDismiss={closePopup}
                type={PanelType.large}
                isBlocking={false}  >
                <div className={UpdatedItem.selectedValue === 'Services' ? 'serviepannelgreena' : ''}>
                    <span className="siteColor"> <h2>Edit Document Metadata - {UpdatedItem.FileReafPartialName}</h2></span>
                </div>
                <div className={UpdatedItem.selectedValue === 'Services' ? 'serviepannelgreena' : 'siteColor'}>
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">BASIC INFORMATION</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">IMAGE INFORMATION</button>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div className="row">
                                <div className="col">
                                    <label>Name</label>
                                    <input className="form-control" type="text" defaultValue={UpdatedItem?.FileReafPartialName} onChange={(e) => setUpdatedItem({ ...UpdatedItem, FileLeafRef: e.target.value })}></input>{UpdatedItem.filetype}
                                    <a onClick={() => DownToUp()}><span className="DownToUp glyphicon glyphicon-arrow-up"></span></a>
                                    <a onClick={() => UpToDown()}> <span className="UpToDown glyphicon glyphicon-arrow-down"></span></a>
                                    <label>Title</label>
                                    <input className="form-control" type="text" defaultValue={UpdatedItem?.Title} onChange={(e) => setUpdatedItem({ ...UpdatedItem, Title: e.target.value })}></input>
                                    <label> ItemRank</label>
                                    <select value={UpdatedItem?.ItemRank} className="form-control" id="ItemRankType" onChange={handleChange}>
                                        <option value="">Select Item Rank</option>
                                        {/* {SharewebItemRank.map((item: any) => (
                                            <option value={item.rank}>{item.rankTitle}</option>
                                        ))} */}
                                    </select>
                                </div>
                                <div className="col">
                                    {UpdatedItem.AllRelevantTasks && <><label>Tasks</label>
                                        <div className="col">
                                            <div className="col">
                                                {/* {UpdatedItem.AllRelevantTasks && UpdatedItem.AllRelevantTasks.map((item: any) => {
                                                    return (
                                                        <div className="block wclr">
                                                            <a className="overflow-tasktext hreflink"
                                                                target="_blank" href={`${PageContext.context._pageContext._web.serverRelativeUrl}/SitePages/Task-Profile.aspx?taskId=${item.Id}&Site=${item.siteType}`}>
                                                                {item.Title}
                                                            </a>
                                                            <a className="delete_gif hreflink" onClick={() => removeAllRelevantTasks(item.Id)}>
                                                                <span className="bg-light svg__icon--cross svg__iconbox"></span>
                                                            </a>
                                                        </div>
                                                    )
                                                })} */}
                                            </div>
                                        </div></>}
                                    <label>	Year</label>
                                    <input className="form-control" type="text" defaultValue={UpdatedItem?.Year} onChange={(e) => setUpdatedItem({ ...UpdatedItem, Year: e.target.value })}></input>
                                    {UpdatedItem.fileType == '.aspx' && <><label>URL</label><input type="text" defaultValue={UpdatedItem?.Url?.Url} onChange={(e) => setUpdatedItem({ ...UpdatedItem, Location: e.target.value })}></input></>}
                                </div>
                                <div className="col">
                                    <div className="col">
                                        <div>
                                            <label className="SpfxCheckRadio">
                                                <input type="radio" className="radio" name="Portfolios" value="Component" title="Component" checked={UpdatedItem.selectedValue === 'Component'} onChange={(e) => onchangeValue('Component')}></input>
                                                Component</label>
                                            <label className="SpfxCheckRadio">
                                                <input type="radio" className="radio" name="Portfolios" value="Services" title="Services" checked={UpdatedItem.selectedValue === 'Services'} onChange={(e) => onchangeValue('Services')} ></input>
                                                Services</label>
                                        </div>
                                        {(UpdatedItem.serviceComponent == undefined || UpdatedItem.serviceComponent?.length == 0) && (UpdatedItem.smartComponent == undefined || UpdatedItem.smartComponent?.length == 0) ? <input type="text" onChange={event => Update1(event.target.value)} className="form-control" id={UpdatedItem.PortfoliosID}></input> : ''}
                                        {display &&
                                            <div className="autoContainer">
                                                {AllComponent && AllComponent.filter((item) => item.label.toLowerCase().indexOf(search.toLowerCase()) > -1).map((val, i) => {
                                                    return (
                                                        <div onClick={() => updateSelectItem(val)} className="option" key={i}>
                                                            <span>{val.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        }
                                        <div className="row">
                                            <div className="col">
                                                <div className="col">
                                                    {/* {UpdatedItem.smartComponent && UpdatedItem.smartComponent.map((component: any) => {
                                                        return (
                                                            <div className="block">
                                                                <a className="hreflink" target="_blank"
                                                                    href={`${PageContext.context._pageContext._web.absoluteUrl}/SitePages/Portfolio-Profile.aspx?taskId=${component?.Id}`}>{component?.Title}</a>
                                                                <a className="hreflink"
                                                                    onClick={() => removeSmartComponent()}>
                                                                    <span className="bg-light svg__icon--cross svg__iconbox"></span>
                                                                </a>
                                                            </div>
                                                        );
                                                    })} */}
                                                    {/* {UpdatedItem.serviceComponent && UpdatedItem.serviceComponent.map((component: any) => {
                                                        return (
                                                            <div className="block">
                                                                <a className="hreflink" target="_blank"
                                                                    href={`${PageContext.context._pageContext._web.absoluteUrl}/SitePages/Portfolio-Profile.aspx?taskId=${component?.Id}`}>{component?.Title}</a>
                                                                <a className="hreflink"
                                                                    onClick={() => removeSmartComponent()}>
                                                                    <span className="bg-light svg__icon--cross svg__iconbox"></span>
                                                                </a>
                                                            </div>
                                                        );
                                                    })} */}
                                                    {/* {UpdatedItem.serviceComponent && UpdatedItem.serviceComponent.map((service: any) => {
                                                        return (
                                                            <div className="block">
                                                                <a className="hreflink" target="_blank"
                                                                    href={`${PageContext.context._pageContext._web.absoluteUrl}/SitePages/Portfolio-Profile.aspx?taskId=${service?.Id}`}>{service?.Title}</a>
                                                                <a className="hreflink"
                                                                    onClick={() => removeServiceComponent()}>
                                                                    <span className="bg-light svg__icon--cross svg__iconbox"></span>
                                                                </a>
                                                            </div>
                                                        );
                                                    })} */}
                                                </div>
                                                {UpdatedItem?.serviceComponent || UpdatedItem?.smartComponent && <div className="col">
                                                    <img src="/sites/HHHH/SiteCollectionImages/ICONS/Foundation/EMMCopyTerm.png" onClick={() => openPopupSmartTaxanomy()}></img>
                                                </div>}
                                            </div>
                                        </div>
                                    </div >
                                    {!UpdatedItem.serviceComponent && !UpdatedItem.smartComponent && <div className="col" >
                                        <label className="full_width">&nbsp;</label>
                                        <img src="/sites/HHHH/SiteCollectionImages/ICONS/Foundation/EMMCopyTerm.png" onClick={() => openPopupSmartTaxanomy()}></img>
                                    </div>}
                                    <label>Document Type</label>
                                    <input className="form-control" type="text" onChange={(e) => setUpdatedItem({ ...UpdatedItem, bekf: e.target.value })}></input>
                                    <div className="col">
                                        <label className="full_width"></label>
                                        <img src="/_layouts/15/images/EMMCopyTerm.png" onClick={() => openSmartTaxonomyPopup('Document Type')}></img>
                                    </div>
                                    <div className="inner-tabb">
                                        {/* {UpdatedItem.smartDocumentTypes && UpdatedItem.smartDocumentTypes.map((item: any) => {
                                            return (
                                                <div className="block">
                                                    {item.Title}
                                                    <a className="hreflink"><img onClick={() => removeSmartDocumentType(item.Id)}></img></a>
                                                </div>
                                            )
                                        })} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        </div>
                    </div>
                </div>
                <div className={UpdatedItem.selectedValue === 'Services' ? 'serviepannelgreena bg-f4 fixed-bottom' : 'siteColor bg-f4 fixed-bottom'}>
                    <div className="align-items-center d-flex justify-content-between me-3 px-4 py-2">
                        <div>
                            <div>Created <span>{UpdatedItem?.Created}</span> by <span className="siteColor">{UpdatedItem?.Author?.Title}</span></div>
                            <div>Last modified <span>{UpdatedItem?.Modified}</span> by <span className="siteColor">{UpdatedItem?.Editor?.Title}</span></div>
                            <div>
                                <a className='hreflink' onClick={() => removeItem(UpdatedItem.Id)}>
                                    <span className="svg__iconbox svg__icon--trash"></span>Delete this item</a>
                            </div>
                        </div>
                        <div>
                            <img src={`${PageContext.context._pageContext._web.absoluteUrl}/SiteCollectionImages/ICONS/32/icon_maill.png`} />
                            <a className="mx-2" href={`mailto:?subject=[${UpdatedItem.Title}] &body=${UpdatedItem.Item_x0020_Description != undefined && UpdatedItem.Item_x0020_Description != '' ? UpdatedItem.Item_x0020_Description : ''} %0A${UpdatedItem.EncodedAbsUrl}?web=1`}>
                                Share  this Document
                            </a>
                            |
                            <a className="mx-1" target="_blank" href={`${PageContext.context._pageContext._web.absoluteUrl}/Documents/Forms/EditForm.aspx?ID=${UpdatedItem.ID}`}>Open out-of-the-box form</a>
                            <button className="btn btn-primary mx-2" onClick={UpdateItem}>Save</button>
                            <button className="btn btn-default" onClick={closePopup}>Cancel</button>
                        </div>
                    </div>
                </div>
            </Panel >
    )
}
export default DocumentPopup