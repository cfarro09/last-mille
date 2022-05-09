/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { TemplateIcons, TemplateBreadcrumbs, TitleDetail, FieldEdit, FieldSelect, FieldEditArray, FieldMultiSelect, IOSSwitch, TemplateSwitch, TemplateSwitchArray } from 'components';
import { getTemplatesZyx, getStoresByClientId, getValuesFromDomain, insCorp, insTemplate } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useForm, useFieldArray } from 'react-hook-form';
import { getCollection, execute, getMultiCollection, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import ClearIcon from '@material-ui/icons/Clear';
import { columnsTemplate } from 'common/constants/columnsTemplate';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Delete } from '@material-ui/icons';
import { triggerAsyncId } from 'async_hooks';

interface RowSelected {
    row: Dictionary | null,
    edit: boolean
}
interface MultiData {
    data: Dictionary[];
    success: boolean;
}
const arrayBread = [
    { id: "view-1", name: "Plantilla" },
    { id: "view-2", name: "Detalle de plantilla" }
];

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: '#fff',
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial'
    },
}));

const Templates: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main);
    const executeResult = useSelector(state => state.main.execute);

    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [waitSave, setWaitSave] = useState(false);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'loadtemplateid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => handleView(row)}
                            deleteFunction={() => handleDelete(row)}
                            editFunction={() => handleEdit(row)}
                        />
                    )
                }
            },
            {
                Header: t(langKeys.description),
                accessor: 'description',
                NoFilter: true
            },
            {
                Header: "Tienda",
                accessor: 'store_name',
                NoFilter: true,
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                NoFilter: true,
            },
            {
                Header: 'Fecha creación',
                accessor: 'createdate',
                NoFilter: true,
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleString()
                }
            },
            {
                Header: 'Registrado por',
                accessor: 'createby',
                NoFilter: true
            },
        ],
        []
    );

    const fetchData = () => dispatch(getCollection(getTemplatesZyx()));

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO"),
            getStoresByClientId(0)
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
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected({ row: null, edit: true });
    }

    const handleView = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: false });
    }

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: true });
    }

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insTemplate({ ...row, operation: 'DELETE', status: 'ELIMINADO', id: row.loadtemplateid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_delete),
            callback
        }))
    }

    if (viewSelected === "view-1") {

        return (
            <TableZyx
                columns={columns}
                titlemodule={"Plantillas"}
                data={mainResult.mainData.data}
                download={true}
                loading={mainResult.mainData.loading}
                register={true}
                handleRegister={handleRegister}
            />
        )
    }
    else if (viewSelected === "view-2") {
        return (
            <DetailTemplate
                data={rowSelected}
                setViewSelected={setViewSelected}
                multiData={mainResult.multiData.data}
                fetchData={fetchData}
            />
        )
    } else
        return null;

}

interface DetailTemplateProps {
    data: RowSelected;
    setViewSelected: (view: string) => void;
    multiData: MultiData[];
    fetchData: () => void
}

const DetailTemplate: React.FC<DetailTemplateProps> = ({ data: { row }, setViewSelected, multiData, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const [columnList, setColumnList] = useState<Dictionary[]>(columnsTemplate);
    // const [columnsSelected, setColumnsSelected] = useState<Dictionary[]>([]);


    const dispatch = useDispatch();
    const { t } = useTranslation();

    const dataStatus = multiData[0] && multiData[0].success ? multiData[0].data : [];
    const dataStores = multiData[1] && multiData[1].success ? multiData[1].data : [];

    const { register, handleSubmit, setValue, getValues, control, formState: { errors }, trigger } = useForm({
        defaultValues: {
            id: row ? row.loadtemplateid : 0,
            description: row ? (row.description || '') : '',
            type: row ? row.type : 'NINGUNO',
            clientid: row?.clientid || 0,
            storeid: row?.storeid || 0,
            status: row?.status || 'ACTIVO',
            operation: row ? "UPDATE" : "INSERT",
            columns: JSON.parse(row?.json_detail || "[]")
        }
    });

    const { fields: fieldsColumns, append: columnsAppend, remove: columnRemove } = useFieldArray({
        control,
        name: 'columns',
    });

    React.useEffect(() => {
        register('description', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('status', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('storeid', { validate: (value) => (value && (value || 0) > 0) || t(langKeys.field_required) });

        if (row?.json_detail) {
            const columnsSelected = JSON.parse(row.json_detail);
            setColumnList(columnList.filter(x => !columnsSelected.some((y: Dictionary) => y.columnbd === x.columnbd)))
        } else {
            setValue(`columns`, columnsTemplate.filter(x => x.obligatory));
            setColumnList(columnList.filter(x => !x.obligatory));
            trigger("columns");
        }
    }, [register, row]);

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(row ? langKeys.successful_edit : langKeys.successful_register) }))
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1")
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    const onSubmit = handleSubmit((data) => {
        const callback = async () => {
            dispatch(showBackdrop(true));
            setWaitSave(true)
            dispatch(execute(insTemplate({
                ...data,
                columns: undefined,
                json_detail: JSON.stringify(data.columns)
            })));
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_save),
            callback
        }))
    });

    console.log("columns", getValues("columns"))

    return (
        <div style={{ width: '100%' }}>
            <form onSubmit={onSubmit}>
                <div>
                    <TemplateBreadcrumbs
                        breadcrumbs={arrayBread}
                        handleClick={setViewSelected}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <TitleDetail
                        title={row ? `${row.description}` : "Nueva plantilla"}
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            type="button"
                            color="primary"
                            startIcon={<ClearIcon color="secondary" />}
                            style={{ backgroundColor: "#FB5F5F" }}
                            onClick={() => setViewSelected("view-1")}
                        >{t(langKeys.back)}</Button>
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            type="submit"
                            startIcon={<SaveIcon color="secondary" />}
                            style={{ backgroundColor: "#55BD84" }}
                        >{t(langKeys.save)}
                        </Button>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx" style={{ marginBottom: 0 }}>
                        <FieldEdit
                            label={"Descripción"}
                            className="col-4"
                            valueDefault={getValues('description')}
                            onChange={(value) => setValue('description', value)}
                            error={errors?.description?.message}
                        />
                        <FieldSelect
                            label="Tienda"
                            valueDefault={getValues('storeid')}
                            onChange={(value) => {
                                setValue('storeid', value?.storeid || 0);
                                setValue('clientid', value?.clientid || 0)
                            }}
                            className="col-4"
                            error={errors?.storeid?.message}
                            data={dataStores}
                            optionDesc="description"
                            optionValue="storeid"
                        />
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-4"
                            valueDefault={getValues('status')}
                            onChange={(value) => setValue('status', value?.domainvalue)}
                            error={errors?.status?.message}
                            data={dataStatus}
                            uset={true}
                            prefixTranslation="status_"
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div style={{ marginLeft: 10, marginRight: 10 }}>
                        <FieldSelect
                            label={"Agregar columna"}
                            variant='outlined'
                            // valueDefault={getValues('status')}
                            onChange={(value) => {
                                if (value) {
                                    setColumnList(columnList.filter(x => x.columnbd !== value.columnbd));
                                    columnsAppend({
                                        ...value,
                                        keyexcel: ''
                                    })
                                }
                            }}
                            data={columnList}
                            optionDesc="columnbddesc"
                            optionValue="columnbd"
                        />
                        <div style={{ marginTop: 16 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{""}</TableCell>
                                            <TableCell>{"Columna BD"}</TableCell>
                                            <TableCell>{"Columna Excel"}</TableCell>
                                            <TableCell>{"Obligatorio"}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody style={{ marginTop: 5 }}>
                                        {fieldsColumns.map((item: Dictionary, i: number) => (
                                            <TableRow key={item.id}>
                                                <TableCell width={30}>
                                                    {!getValues(`columns.${i}.obligatory`) && (
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => columnRemove(i)}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.columnbddesc}
                                                </TableCell>
                                                <TableCell>
                                                    <FieldEditArray
                                                        fregister={{
                                                            ...register(`columns.${i}.keyexcel`, {
                                                                validate: {
                                                                    validate: (value: any) => (value && value.length) || t(langKeys.field_required)
                                                                }
                                                            }),
                                                        }}
                                                        valueDefault={getValues(`columns.${i}.keyexcel`) || ""}
                                                        error={errors?.columns?.[i]?.keyexcel?.message}
                                                        onChange={(value) => setValue(`columns.${i}.keyexcel`, value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TemplateSwitchArray
                                                        defaultValue={getValues(`columns.${i}.obligatory`) || getValues(`columns.${i}.obligatorycolumn`)}
                                                        fregister={{
                                                            ...register(`columns.${i}.obligatorycolumn`)
                                                        }}
                                                        disabled={getValues(`columns.${i}.obligatory`)}
                                                        label={""}
                                                        // className={classes.switches}
                                                        onChange={(value) => setValue(`columns.${i}.obligatorycolumn`, value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Templates;