import React, { useState, useEffect, useRef } from 'react';
import { Select, Page, DropdownIcon, Progressing, ConfirmationDialog, showError, useJsonYaml } from '../../common';
import { getEnvironmentListMin, getTeamListMin } from '../../../services/service';
import { toast } from 'react-toastify';
import { DeployChartProps } from './deployChart.types';
import { MarkDown } from '../discoverChartDetail/DiscoverChartDetails'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { useHistory, useParams } from 'react-router'
import { URLS } from '../../../config'
import deleteIcon from '../../../assets/icons/ic-delete.svg'
import { installChart, updateChart, deleteInstalledChart, getChartValuesCategorizedListParsed, getChartValues } from '../charts.service'
import { ChartValuesSelect } from '../util/ChartValueSelect';
import { getChartValuesURL } from '../charts.helper';
import './DeployChart.scss';
import ReactGA from 'react-ga';

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw 'parameter is not an array'
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
}

const DeployChart: React.FC<DeployChartProps> = ({
    installedAppId,
    installedAppVersion,
    appStoreVersion,
    appName: originalName,
    versions,
    valuesYaml = JSON.stringify({}),
    rawValues = "",
    environmentId = null,
    teamId = null,
    onHide,
    chartName = "",
    name = "",
    readme = "",
    chartIdFromDeploymentDetail = 0,
    chartValuesFromParent = { id: 0, name: '', chartVersion: '', kind: null, environmentName: "" },
    ...rest }) => {
    const [teams, setTeams] = useState(new Map())
    const [environments, setEnvironments] = useState(new Map())
    const [loading, setLoading] = useState(false);
    const [selectedVersion, selectVersion] = useState(appStoreVersion)
    const [selectedTeam, selectTeam] = useState(teamId)
    const [selectedEnvironment, selectEnvironment] = useState(environmentId)
    const [appName, setAppName] = useState(originalName)
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [textRef, setTextRef] = useState(rawValues)
    const [obj, json, yaml, error] = useJsonYaml(textRef, 4, 'yaml', true)
    const [chartValuesList, setChartValuesList] = useState([])
    const [chartValues, setChartValues] = useState(chartValuesFromParent);
    const { push } = useHistory()
    const { chartId, envId } = useParams()
    const [showCodeEditorError, setCodeEditorError] = useState(false);
    const deployChartForm = useRef(null);
    const deployChartEditor = useRef(null);
    const fetchTeams = async () => {
        let response = await getTeamListMin()
        if (response && response.result) {
            const teams = mapById(response.result)
            setTeams(teams)
        }
    }

    const fetchEnvironments = async () => {
        let response = await getEnvironmentListMin()
        if (response && response.result) {
            const environments = mapById(response.result)
            setEnvironments(environments)
        }
    }

    function closeMe(event = null) {
        if (event.keyCode === 27 && typeof onHide === 'function') {
            onHide(false);
        }
    }

    async function getChartValuesList() {
        setLoading(true)
        try {
            const { result } = await getChartValuesCategorizedListParsed(chartId);
            setChartValuesList(result);
        }
        catch (err) { }
        finally {
            setLoading(false)
        }
    }

    const deploy = async (e) => {
        if (!(selectedTeam && selectedEnvironment)) {
            return
        }
        if (!environmentId && !teamId && !appName) {
            toast.warn('App name should not be empty and spaces are not allowed.')
            return
        }
        if (!obj) {
            toast.error(error)
            return
        }
        try {
            setLoading(true)
            if (installedAppVersion) {
                let request = {
                    id: installedAppVersion,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    valuesOverride: obj,
                    valuesOverrideYaml: textRef,
                }
                await updateChart(request)
                toast.success('Deployment initiated')
                setLoading(false)
                onHide(true)
            }
            else {
                let request = {
                    teamId: selectedTeam,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    environmentId: selectedEnvironment,
                    appStoreVersion: selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: textRef,
                    appName
                };
                const { result: { environmentId: newEnvironmentId, installedAppId } } = await installChart(request);
                toast.success('Deployment initiated')
                push(`/chart-store/deployments/${installedAppId}/env/${newEnvironmentId}`)
            }
        }
        catch (err) {
            if (Array.isArray(err.errors)) {
                err.errors.map(({ userMessage }, idx) => toast.error(userMessage, { autoClose: false }))
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        // scroll to the editor view with animation for only update-chart
        if (envId) {
            setTimeout(() => {
                deployChartForm.current.scrollTo({
                    top: deployChartEditor.current.offsetTop,
                    behavior: 'smooth',
                });
            }, 1000);
        }
    }, []);

    useEffect(() => {
        if (chartId) {
            getChartValuesList();
        }
        document.addEventListener("keydown", closeMe);
        if (versions) {
            fetchTeams()
            fetchEnvironments()
        }
        return () => { document.removeEventListener("keydown", closeMe); }
    }, [])

    useEffect(() => {
        let cv = versions.get(selectedVersion);
        if (chartValues && cv && cv.version !== chartValues.chartVersion) {
            setCodeEditorError(true);
        }
        else setCodeEditorError(false);
    }, [selectedVersion])

    useEffect(() => {
        if (chartIdFromDeploymentDetail) {
            if (chartIdFromDeploymentDetail) getChartValuesCategorizedListParsed(chartIdFromDeploymentDetail).then((response) => {
                setChartValuesList(response.result);
            }).catch((error) => {
                showError(error);
            })
        }
    }, [chartIdFromDeploymentDetail])

    useEffect(() => {
        if (chartValues.id && chartValues.chartVersion) {
            getChartValues(chartValues.id, chartValues.kind).then((response) => {
                let values = response.result.values || "";
                setTextRef(values);
                let cv = versions.get(selectedVersion);
                if (chartValues && cv && cv.version !== chartValues.chartVersion) {
                    setCodeEditorError(true);
                }
                else setCodeEditorError(false);
            }).catch((error) => {
                showError(error);
            })
        }
    }, [chartValues])

    useEffect(() => {
        if (chartValuesFromParent.id) {
            setChartValues(chartValuesFromParent);
        }
    }, [chartValuesFromParent])

    async function handleDelete(e) {
        setDeleting(true)
        try {
            await deleteInstalledChart(installedAppId)
            toast.success('Successfully deleted.')
            push(URLS.CHARTS)
        }
        catch (err) {
            showError(err)
        }
        finally {
            setDeleting(false)
        }
    }

    async function redirectToChartValues() {
        let id = chartId || chartIdFromDeploymentDetail;
        let url = getChartValuesURL(id);
        push(url);
    }

    let isUpdate = environmentId && teamId;
    let isDisabled = isUpdate ? false : !(selectedEnvironment && selectedTeam && selectedVersion && appName?.length);
    let teamObj = teams.get(selectedTeam);
    let envObj = environments.get(selectedEnvironment);
    let chartVersionObj = versions.get(selectedVersion);
    return (<>
        <div className={`deploy-chart-container ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'}`}>
            <div className="header-container flex column">
                <div className="title">{chartName}/ {name}</div>
                <div className="border" />
            </div>
            <ReadmeColumn readmeCollapsed={readmeCollapsed} toggleReadmeCollapsed={toggleReadmeCollapsed} readme={readme} />
            <div className="deploy-chart-body">
                <div className="overflown" ref={deployChartForm}>
                    <div className="hide-scroll">
                        <label className="form__row form__row--w-100">
                            <span className="form__label">App Name</span>
                            <input autoComplete="off" tabIndex={1} placeholder="app name" className="form__input" value={appName} autoFocus disabled={!!isUpdate} onChange={e => setAppName(e.target.value)} />
                        </label>
                        <label className="form__row form__row--w-100">
                            <span className="form__label">Project</span>
                            <Select tabIndex={2} rootClassName="select-button--default" disabled={!!isUpdate} onChange={event => selectTeam(event.target.value)} value={selectedTeam}>
                                <Select.Button>{teamObj ? teamObj.name : 'Select Project'}</Select.Button>
                                {teams && Array.from(teams).map(([teamId, teamData], idx) => <Select.Option key={teamId} value={teamId}>{teamData.name}</Select.Option>)}
                            </Select>
                        </label>
                        <div className="form__row form__row--w-100">
                            <span className="form__label">Environment</span>
                            <Select tabIndex={3} rootClassName="select-button--default" value={selectedEnvironment} disabled={!!isUpdate} onChange={e => selectEnvironment(e.target.value)}>
                                <Select.Button>{envObj ? envObj.environment_name : 'Select Environment'}</Select.Button>
                                {environments && Array.from(environments).map(([envId, envData], idx) => <Select.Option key={envId} value={envId}>{envData.environment_name}</Select.Option>)}
                            </Select>
                        </div>
                        <div className="form__row form__row--flex form__row--w-100">
                            <div className="w-50">
                                <span className="form__label">Chart Version</span>
                                <Select tabIndex={4} rootClassName="select-button--default" disabled={!!environmentId && !!teamId} value={selectedVersion} onChange={event => selectVersion(event.target.value)}>
                                    <Select.Button>{chartVersionObj ? chartVersionObj.version : 'Select Version'}</Select.Button>
                                    {Array.from(versions).map(([versionId, versionData], idx) => <Select.Option key={versionId} value={versionId}>{versionData.version}</Select.Option>)}
                                </Select>
                            </div>
                            <span className="mr-16"></span>
                            <div className="w-50">
                                <span className="form__label">Chart Values*</span>
                                <ChartValuesSelect chartValuesList={chartValuesList} chartValues={chartValues} redirectToChartValues={redirectToChartValues}
                                    onChange={(event) => { setChartValues(event) }} />
                            </div>
                        </div>
                        <div className="code-editor-container" ref={deployChartEditor}>
                            <CodeEditor
                                value={textRef}
                                noParsing
                                mode="yaml"
                                onChange={value => { setTextRef(value) }}>
                                <CodeEditor.Header>
                                    <span className="bold">values.yaml</span>
                                </CodeEditor.Header>
                            </CodeEditor>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cta-container">
                {isUpdate && <button className="cta delete" onClick={e => toggleConfirmation(true)}>Delete Application</button>}
                <button type="button" tabIndex={6}
                    disabled={isDisabled || loading}
                    className={`cta flex-1 ml-16 mr-16 ${isDisabled ? 'disabled' : ''}`}
                    onClick={deploy}>
                    {loading ? <Progressing /> : isUpdate ? 'update and deploy' : 'deploy chart'}
                </button>
            </div>
            {confirmation &&
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={deleteIcon} />
                    <ConfirmationDialog.Body title={`Delete '${originalName}'`} subtitle={`This will delete all resources associated with this application.`}>
                        <p style={{ marginTop: '20px' }}>Deleted applications cannot be restored.</p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button className="cta cancel" type="button" onClick={e => toggleConfirmation(false)}>Cancel</button>
                        <button className="cta delete" type="button" disabled={deleting} onClick={handleDelete}>{deleting ? <Progressing /> : 'Delete'}</button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            }
        </div>
    </>
    )
}

function ReadmeColumn({ readmeCollapsed, toggleReadmeCollapsed, readme, ...props }) {
    return (
        <div className="deploy-chart__readme-column">
            <MarkDown markdown={readme} className="deploy-chart__readme-markdown" />
            <aside className="flex column" onClick={readme ? (e) => {
                if (readmeCollapsed) {
                    ReactGA.event({
                        category: 'DeployChart',
                        action: 'Readme Expands',
                        label: ''
                    });
                }
                toggleReadmeCollapsed(t => !t)
            } : e => { }}>
                {readme && <DropdownIcon className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `${readmeCollapsed ? -90 : 90}deg` }} color={readmeCollapsed ? '#06c' : 'white'} />}
                {readmeCollapsed && <div className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `-90deg`, width: '106px', margin: '70px' }}>{readme ? 'View Readme.md' : 'README.md not available'}</div>}
                {readmeCollapsed && <Page className="rotate" style={{ ['--rotateBy' as any]: `0deg` }} />}
            </aside>
        </div>
    )
}

export default DeployChart