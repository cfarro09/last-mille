/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { deleteImageGuide, getPaginatedResourcesControl } from 'common/helpers';
import { execute, getCollectionPaginated, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageLightBox, manageConfirmation } from 'store/popus/actions';
import TablePaginated from 'components/fields/table-paginated';
import { useDispatch } from 'react-redux';
import { useSelector } from 'hooks';
import { Dictionary, IFetchData } from '@types'
import { langKeys } from 'lang/keys';
import { useTranslation } from 'react-i18next';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Avatar from '@material-ui/core/Avatar';
import PublishIcon from '@material-ui/icons/Publish';
import Tooltip from "@material-ui/core/Tooltip";
import { IconButton } from '@material-ui/core';
import { PhotoLibrary } from '@material-ui/icons';
import { DialogZyx } from 'components';
import CloseIcon from '@material-ui/icons/Close';

const DialogImages: React.FC<{
    fetchData: () => void,
    setOpenModal: (param: any) => void,
    openModal: boolean,
    images: string[],
    guide: Dictionary | null
}> = ({ setOpenModal, openModal, fetchData, guide, images }) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitChange, setWaitChange] = useState(false);
    const changeRes = useSelector(state => state.main.execute);

    useEffect(() => {
        if (waitChange) {
            if (!changeRes.loading && !changeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_close_ticket) }))
                setOpenModal(false);
                dispatch(showBackdrop(false));
                fetchData()
                setWaitChange(false);
            } else if (changeRes.error) {
                dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.error_unexpected_error) }))
                dispatch(showBackdrop(false));
                setWaitChange(false);
            }
        }
    }, [changeRes, waitChange])
    console.log("guide", guide)
    const deleteImages = (url: string) => {
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de eliminar la imagen?",
            callback: () => {
                dispatch(execute(deleteImageGuide(guide!!.guideid, guide!!.shippingorderid, url)));
                dispatch(showBackdrop(true));
                setWaitChange(true);
            }
        }))
    }

    return (
        <DialogZyx
            open={openModal}
            title={`Guia ${guide?.guide_number || ""}`}
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenModal(false)}
            handleClickButton2={undefined}
            button2Type="submit"
        >
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {images.map((image, index) => (
                    <div key={index} style={{ width: 180, height: 180, position: "relative" }}>
                        <img
                            src={image}
                            alt="img"
                            style={{ width: '100%', height: "100%", objectFit: "cover" }}
                            onClick={() => window.open(image)}
                        />
                        <IconButton
                            size='small'
                            color='primary'
                            style={{ position: "absolute", right: 0 }}
                            onClick={() => {
                                deleteImages(image)
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                ))}
            </div>
        </DialogZyx>
    )
}

const ResourcesControl = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [valuefile, setvaluefile] = useState('')
    const [openDialogImages, setOpenDialogImages] = useState(false);
    const [guideSelected, setGuideSelected] = useState<Dictionary | null>(null);
    const mainPaginated = useSelector(state => state.main.mainPaginated);
    const resExportData = useSelector(state => state.main.exportData);
    const [waitSave, setWaitSave] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [fetchDataAux, setfetchDataAux] = useState<IFetchData>({ pageSize: 0, pageIndex: 0, filters: {}, sorts: {}, daterange: null })

    const handleChange = (files: any, infoguide: Dictionary) => {
        const imagefile = files[0];

        const callback = async () => {
            dispatch(showBackdrop(true));

            const formData = new FormData();
            formData.append("imagen", imagefile);
            formData.append("name", imagefile.name);
            formData.append("id_shipping_order", infoguide.shippingorderid);
            formData.append("guide_number", infoguide.guide_number);
            formData.append("tipo_imagen", "IMAGEN_PD");
            formData.append("descripcion", "image from web");

            try {
                fetch("https://api2.qaplaperu.com/api/web/shipping/imagen", {
                    method: "POST",
                    body: formData
                })
                    .then((response) => response.json())
                    .then((data) => {
                        dispatch(showBackdrop(false));
                        fetchDataAux2()
                    })
            }
            catch (error) {
                console.error("error");
                dispatch(showBackdrop(false));
            }

        }

        dispatch(manageConfirmation({
            visible: true,
            question: `¿Desea subir la imagen ${imagefile.name} al pedido N° guia: ${infoguide.guide_number}`,
            callback
        }));
        setvaluefile('');
    }

    const columns = React.useMemo(
        () => [
            {
                Header: "Imágenes",
                accessor: "id_guide",
                isComponent: true,
                Cell: (props: any) => {
                    const { imagenes } = props.cell.row.original;
                    if (!imagenes)
                        return null;
                    return (
                        <AvatarGroup max={3} onClick={() => {
                            dispatch(manageLightBox({ visible: true, images: imagenes.split(","), index: 0 }))
                        }}>
                            {imagenes.split(",").map((image: string) => (
                                <Avatar
                                    key={image}
                                    src={image}
                                    onClick={() => 'hola ' + image}
                                />
                            ))}
                        </AvatarGroup>
                    )
                }
            },
            {
                Header: "",
                accessor: "id_shipping_order",
                isComponent: true,
                Cell: (props) => {
                    const guide = props.cell.row.original;
                    return (
                        <IconButton
                            size='small'
                            onClick={() => {
                                setGuideSelected(guide);
                                setOpenDialogImages(true)
                            }}
                        >
                            <PhotoLibrary />
                        </IconButton>
                    )
                }
            },
            {
                Header: "",
                accessor: "aa2",
                isComponent: true,
                Cell: (props) => (
                    <>
                        <input
                            accept="image/*"
                            id={`inputfile-${props.cell.row.original.id_shipping_order}${props.cell.row.original.guide_number}`}
                            type="file"
                            value={valuefile}
                            style={{ display: 'none' }}
                            onChange={(e) => handleChange(e.target.files, props.cell.row.original)}
                        />
                        <label htmlFor={`inputfile-${props.cell.row.original.id_shipping_order}${props.cell.row.original.guide_number}`}>
                            <Tooltip title="Subir imagen">
                                <PublishIcon
                                    style={{ cursor: 'pointer' }}
                                />
                            </Tooltip>
                        </label>
                    </>
                )
            },
            {
                Header: "Intento",
                accessor: "attempt"
            },
            {
                Header: "Intentos",
                accessor: "attempts"
            },
            {
                Header: "Fecha de registro",
                accessor: "createdate",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleString()
                }
            },
            {
                Header: "Fecha de distribución",
                accessor: "fecha_dist",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.fecha_dist).toLocaleString()
                }
            },
            {
                Header: "N° Guia",
                accessor: "guide_number"
            },
            {
                Header: "N° imagenes",
                accessor: "images_count"
            },
            {
                Header: "Observaciones",
                accessor: "observaciones"
            },
            {
                Header: "Organización",
                accessor: "org_name"
            },
            {
                Header: "N° Placa",
                accessor: "plate_number"
            },
            {
                Header: "Estado",
                accessor: "status"
            },
            {
                Header: "Type",
                accessor: "type"
            },
        ],
        [fetchDataAux]
    );

    const fetchData = ({ pageSize, pageIndex, filters, sorts, daterange }: IFetchData) => {
        setfetchDataAux({ pageSize, pageIndex, filters, sorts, daterange })
        dispatch(getCollectionPaginated(getPaginatedResourcesControl({
            startdate: daterange.startDate!,
            enddate: daterange.endDate!,
            take: pageSize,
            skip: pageIndex * pageSize,
            sorts: sorts,
            filters: {
                ...filters,
            },
        })))
    };

    const fetchDataAux2 = () => {
        fetchData(fetchDataAux);
    };

    useEffect(() => {
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainPaginated.loading && !mainPaginated.error) {
            setPageCount(fetchDataAux.pageSize ? Math.ceil(mainPaginated.count / fetchDataAux.pageSize) : 0);
            settotalrow(mainPaginated.count);
        }
    }, [mainPaginated])

    useEffect(() => {
        if (waitSave) {
            if (!resExportData.loading && !resExportData.error) {
                dispatch(showBackdrop(false));
                setWaitSave(false);
                window.open(resExportData.url, '_blank');
            } else if (resExportData.error) {
                const errormessage = t(resExportData.code || "error_unexpected_error", { module: t(langKeys.property).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [resExportData, waitSave])

    console.log("openDialogImages", openDialogImages)

    return (
        <>
            <TablePaginated
                columns={columns}
                data={mainPaginated.data}
                titlemodule="Control de recursos"
                totalrow={totalrow}
                loading={mainPaginated.loading}
                pageCount={pageCount}
                filterrange={true}
                download={false}
                fetchData={fetchData}
                filterRangeDate="today"
            />
            <DialogImages
                openModal={openDialogImages}
                setOpenModal={setOpenDialogImages}
                images={((guideSelected?.imagenes || "") + "").split(",")}
                guide={guideSelected}
                fetchData={fetchDataAux2}
            />
        </>
    )
}

export default ResourcesControl;