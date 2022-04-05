/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { TemplateIcons } from 'components';
import { getCorpSel, getOrgSel, getValuesFromDomain, insOrg } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { getCollection, getMultiCollection, execute, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import { getCurrencyList } from "store/signup/actions";

const Organizations: FC = () => {

    return (
        <iframe
            title="Qapla - Página 2"
            width={"100%"} src="https://app.powerbi.com/view?r=eyJrIjoiZTNhZGZiYjQtMDJlMi00Zjk3LThjMmQtZTEzYjViNTVhYmMwIiwidCI6IjBlMGNiMDYwLTA5YWQtNDlmNS1hMDA1LTY4YjliNDlhYTFmNiIsImMiOjR9" frameBorder="0"
            allowFullScreen={true}>

        </iframe>
    );

}

export default Organizations;