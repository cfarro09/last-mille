/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { getPaginatedGuidesMonitor, getMotives, changeStatus } from 'common/helpers';
import { execute, getCollection, getCollectionPaginated, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import TablePaginated from 'components/fields/table-paginated';
import { useDispatch } from 'react-redux';
import { useSelector } from 'hooks';
import { Dictionary, IFetchData } from '@types'
import { langKeys } from 'lang/keys';
import { useTranslation } from 'react-i18next';
import { DialogZyx, FieldSelect } from 'components';
import { useForm } from 'react-hook-form';
import IconButton from '@material-ui/core/IconButton';
import CachedIcon from '@material-ui/icons/Cached';
import Tooltip from '@material-ui/core/Tooltip';

const listStatus = [
    { status: "ENTREGADO" },
    { status: "NO ENTREGADO" },
]

const DialogChangeStatus: React.FC<{
    fetchData: () => void,
    setOpenModal: (param: any) => void,
    openModal: boolean,
    guide: Dictionary | null
}> = ({ setOpenModal, openModal, fetchData, guide }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitChange, setWaitChange] = useState(false);
    const changeRes = useSelector(state => state.main.execute);
    const listMotives = useSelector(state => state.main.mainData);
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, trigger } = useForm();

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

    useEffect(() => {
        if (openModal) {
            reset({
                status: guide?.status || "",
                motive: ''
            })
            register('status', { validate: (value) => ((value && value.length) || t(langKeys.field_required)) });
            register('motive');
        }
    }, [openModal])

    const onSubmit = handleSubmit((data) => {
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de cambiar el estado de la guia?",
            callback: () => {
                dispatch(execute(changeStatus(guide?.guideid, data.status, data.status === "ENTREGADO" ? "Entrega Exitosa" : data.motive)));
                dispatch(showBackdrop(true));
                setWaitChange(true);
            }
        }))

    });

    return (
        <DialogZyx
            open={openModal}
            title={`Cambiar estado de la guia ${guide?.guide_number}`}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={() => setOpenModal(false)}
            handleClickButton2={onSubmit}
            button2Type="submit"
        >
            <div className="row-zyx">
                <FieldSelect
                    label="Estado"
                    className="col-12"
                    valueDefault={getValues('status')}
                    onChange={(value) => {
                        setValue('status', value?.status || '');
                        trigger('status');
                        if ((value?.status || '') === "ENTREGADO") {
                            register('motive', { validate: (value) => true });
                        } else {
                            register('motive', { validate: (value) => ((value && value.length) || t(langKeys.field_required)) });
                        }
                    }}
                    error={errors?.status?.message}
                    data={listStatus}
                    optionDesc="status"
                    optionValue="status"
                />
                {getValues('status') === "NO ENTREGADO" &&
                    <FieldSelect
                        label="Motivo"
                        className="col-12"
                        valueDefault={getValues('motive')}
                        onChange={(value) => setValue('motive', value ? value.name : '')}
                        error={errors?.motive?.message}
                        data={listMotives.data}
                        loading={listMotives.loading}
                        optionDesc="name"
                        optionValue="name"
                    />
                }
            </div>
        </DialogZyx>)
}

const ResourcesControl = () => {
    const dispatch = useDispatch();

    const [guideSelected, setguideSelected] = useState<Dictionary | null>(null)
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [fetchDataAux, setfetchDataAux] = useState<IFetchData>({ pageSize: 0, pageIndex: 0, filters: {}, sorts: {}, daterange: null })
    const [openDialogChangeStatus, setopenDialogChangeStatus] = useState(false);
    const mainPaginated = useSelector(state => state.main.mainPaginated);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'guideid',
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const guide = props.cell.row.original;
                    if (guide.status === "ENTREGADO" || guide.status === "NO ENTREGADO") {
                        return (
                            <Tooltip title="Cambiar de estado" arrow placement="top">
                                <IconButton size='small'>
                                    <CachedIcon
                                        onClick={() => {
                                            setguideSelected(guide)
                                            setopenDialogChangeStatus(true);
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                        )
                    }
                    return null;
                }
            },
            {
                Header: "Tienda",
                accessor: "store_name",
            },
            {
                Header: "N° Guia",
                accessor: "guide_number",
            },
            {
                Header: "Código seguimiento",
                accessor: "seg_code",
            },
            {
                Header: "Código alterno 1",
                accessor: "alt_code1",
            },
            {
                Header: "Código de barras",
                accessor: "client_barcode",
            },
            {
                Header: "Estado",
                accessor: "status",
            },
            {
                Header: "DNI Cliente",
                accessor: "client_dni",
            },
            {
                Header: "Nombre Cliente",
                accessor: "client_name",
            },
            {
                Header: "Teléfono Cliente",
                accessor: "client_phone1",
            },
            {
                Header: "Reportadoa a integración",
                accessor: "reportado_integracion",
            },
            {
                Header: "Dirección",
                accessor: "address",
            },
            {
                Header: "Departamento",
                accessor: "department",
            },
            {
                Header: "Provincia",
                accessor: "province",
            },
            {
                Header: "Distrito",
                accessor: "district",
            },
            {
                Header: "Fecha de registro",
                accessor: "createdate",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleString()
                }
            },
        ],
        [fetchDataAux]
    );

    const fetchData = ({ pageSize, pageIndex, filters, sorts, daterange }: IFetchData) => {
        setfetchDataAux({ pageSize, pageIndex, filters, sorts, daterange })
        dispatch(getCollectionPaginated(getPaginatedGuidesMonitor({
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
        dispatch(getCollection(getMotives()))

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

    return (
        <>
            <TablePaginated
                columns={columns}
                data={mainPaginated.data}
                totalrow={totalrow}
                titlemodule="Monitoreo de guias"
                loading={mainPaginated.loading}
                pageCount={pageCount}
                filterrange={true}
                download={false}
                fetchData={fetchData}
                filterRangeDate="today"
            />
            <DialogChangeStatus
                openModal={openDialogChangeStatus}
                setOpenModal={setopenDialogChangeStatus}
                fetchData={fetchDataAux2}
                guide={guideSelected}
            />
        </>
    )
}

export default ResourcesControl;