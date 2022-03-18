/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { getCorpSel, selShippingOrder, getValuesFromDomain } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { getCollection, getMultiCollection, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop } from 'store/popus/actions';
import { IconButton } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';

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
const Manifest: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main);
    const executeResult = useSelector(state => state.main.execute);

    const [waitSave, setWaitSave] = useState(false);

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
                        <div style={{ whiteSpace: 'nowrap', display: 'flex' }}>
                            <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                size="small"
                                onClick={() => triggerProcessLoad(row.shippingorderid)}
                            >
                                <ReceiptIcon style={{ color: '#B6B4BA' }} />
                            </IconButton>

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
                accessor: 'number_guides',
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
        // dispatch(getCurrencyList())
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO"),
            getValuesFromDomain("TIPOORG"),
            getCorpSel(0)
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
        <TableZyx
            columns={columns}
            titlemodule="Manifiestos"
            data={mainResult.mainData.data.map((x: Dictionary) => ({ ...x, drivername: `${x.first_name} ${x.last_name}` }))}
            download={true}
            loading={mainResult.mainData.loading}
            register={false}
        />
    )

}

export default Manifest;