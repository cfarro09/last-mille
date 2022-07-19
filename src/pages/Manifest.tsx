/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { getCorpSel, selShippingOrder, getValuesFromDomain, getDrivers, changeDriver, getShippingDetail } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { execute, getCollection, getMultiCollection, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { DialogZyx, FieldSelect } from 'components';
import ListIcon from '@material-ui/icons/List';
import SaveIcon from '@material-ui/icons/Save';


const fetch_post = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if (response.ok) {
        try {
            return await response.json();
        } catch (e) {
        }
    } else {
    }
}

const DialogDetail: React.FC<{
    fetchData: () => void,
    setOpenModal: (param: any) => void,
    openModal: boolean,
    offer: Dictionary | null
}> = ({ setOpenModal, openModal, fetchData, offer }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const multiData = useSelector(state => state.main.multiData);
    const [dataDriver, setDataDriver] = useState<Dictionary[]>([]);
    const [dataDetail, setDataDetail] = useState<Dictionary[]>([])
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector(state => state.main.execute);
    const [driverSelected, setDriverSelected] = useState<Dictionary | null>(null);

    const columns = React.useMemo(
        () => [
            {
                Header: 'CLIENTE',
                accessor: 'client_name'
            },
            {
                Header: 'COD BARRAS CLIENTE',
                accessor: 'client_barcode'
            },
            {
                Header: 'DNI CLIENTE',
                accessor: 'client_dni'
            },
            {
                Header: 'COD SEGUIMIENTO',
                accessor: 'seg_code'
            },
            {
                Header: 'ESTADO',
                accessor: 'status'
            },
        ],
        []
    );

    useEffect(() => {
        if (!multiData.error && !multiData.loading && multiData.data.length > 0) {
            const posibleDriver = multiData.data.find(x => x.key === "SP_VEHICLE_DRIVER");
            const posibleDataDetail = multiData.data.find(x => x.key === "SP_SEL_SHIPPING_DETAIL");
            if (posibleDataDetail) {
                setDataDetail(posibleDataDetail.data);
            }
            if (posibleDriver) {
                setDataDriver((posibleDriver.success ? posibleDriver.data : []).map(x => ({ ...x, description: `${x.fullname} ${x.plate_number} ${x.vehicle_type}` })));
            }
        }
    }, [multiData])

    useEffect(() => {
        if (openModal) {
            setDriverSelected(null);

            dispatch(getMultiCollection([
                getShippingDetail(offer?.shippingorderid)
            ]));
        }
    }, [openModal])

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.organization_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const changeDriverTrigger = () => {
        if (driverSelected) {
            const { driverid, vehicleid } = driverSelected;
            const callback = () => {
                dispatch(showBackdrop(true));
                dispatch(execute(changeDriver(driverid, vehicleid, offer?.shippingorderid)));
                setWaitSave(true)
            }

            dispatch(manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback
            }))
        }
    }

    return (
        <DialogZyx
            open={openModal}
            title={`Oferta ${offer?.shippingorderid}`}
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenModal(false)}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['CURSO', 'PENDIENTE', 'ACEPTADO'].includes(offer?.status) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                            <FieldSelect
                                label="Vehiculo"
                                // valueDefault={}
                                // loading={mainResult.loading}
                                optionValue="driverid"
                                optionDesc="description"
                                data={dataDriver}
                                onChange={(value) => setDriverSelected(value)}
                            />
                        </div>
                        <Button
                            variant="contained"
                            disabled={!driverSelected}
                            color="primary"
                            style={{ alignItems: 'center', backgroundColor: "#55BD84", marginTop: 'auto', marginBottom: 'auto' }}
                            onClick={changeDriverTrigger}
                            startIcon={<SaveIcon color="secondary" />}
                        >Guardar</Button>

                    </div>
                )}
                <TableZyx
                    columns={columns}
                    data={dataDetail}
                    filterGeneral={false}
                    download={true}
                    loading={multiData.loading}
                    register={false}
                />
            </div>
        </DialogZyx>)
}

const Manifest: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main);
    const executeResult = useSelector(state => state.main.execute);
    const [openDetail, setOpenDetail] = useState(false)
    const [waitSave, setWaitSave] = useState(false);
    const [offer, setOffer] = useState<Dictionary | null>(null)

    const columns = React.useMemo(
        () => [
            {
                accessor: 'clientid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <div style={{ whiteSpace: 'nowrap', display: 'flex', gap: 4 }}>
                            <Tooltip title="Exportar manifiesto" arrow placement="top">
                                <IconButton
                                    aria-haspopup="true"
                                    size="small"
                                    onClick={() => triggerProcessLoad(row.shippingorderid)}
                                >
                                    <ReceiptIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Ver oferta" arrow placement="top">
                                <IconButton
                                    onClick={() => {
                                        setOffer(row)
                                        setOpenDetail(true);
                                    }}
                                    aria-haspopup="true"
                                    size='small'
                                >
                                    <ListIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )
                }
            },

            {
                Header: 'ID',
                accessor: 'shippingorderid'
            },
            {
                Header: 'PROVEEDOR',
                accessor: 'provider_name'
            },
            {
                Header: 'CONDUCTOR',
                accessor: 'drivername'
            },

            {
                Header: 'PLACA VEHICULO',
                accessor: 'plate_number'
            },
            {
                Header: 'N° GUIAS',
                accessor: 'nro_guias',
                type: 'number'
            },
            {
                Header: 'N° BULTOS',
                accessor: 'number_offers',
                type: 'number'
            },
            {
                Header: 'ESTADO',
                accessor: 'status'
            },
            {
                Header: 'FECHA CREACION',
                accessor: 'createdate',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleString()
                }
            },
            {
                Header: 'REGISTRADO POR',
                accessor: 'createby'
            },
        ],
        []
    );

    const triggerProcessLoad = async (shippingorderid: number) => {
        console.log(shippingorderid)
        const result = await fetch_post('https://api2.qaplaperu.com/api/web/shipping/print/hoja_ruta', { shippingorderid })
        window.open(result.data.hoja_ruta, '_blank');
    }
    const fetchData = () => dispatch(getCollection(selShippingOrder()));

    useEffect(() => {
        fetchData();

        dispatch(getMultiCollection([
            getDrivers()
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.organization_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    return (
        <>
            <TableZyx
                columns={columns}
                titlemodule="Manifiestos"
                data={mainResult.mainData.data.map((x: Dictionary) => ({ ...x, drivername: `${x.first_name} ${x.last_name}` }))}
                download={true}
                loading={mainResult.mainData.loading}
                register={false}
            />
            <DialogDetail
                openModal={openDetail}
                setOpenModal={setOpenDetail}
                fetchData={fetchData}
                offer={offer}
            />
        </>
    )

}

export default Manifest;