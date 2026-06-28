// Copyright (C) Microsoft Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { browser } from './dlp_bridge.js';
function $(id) {
    return document.getElementById(id);
}
const kErrorText = '(ERROR)';
function addListeners() {
    $('get-wip-trust').addEventListener('click', doCheckWipHostTrust);
    $('check-mdatp-access').addEventListener('click', doCheckMdatpAccess);
    $('check-endpointdlp-file-policies').addEventListener('click', doCheckMdatpFilePolices);
    $('check-endpointdlp-website-policies').addEventListener('click', doCheckMdatpUrlPolices);
    $('get-saas-dlp-site-policy-profile').addEventListener('click', getSaasDlpSitePolicyProfile);
    $('get-saas-dlp-site-policy-device').addEventListener('click', getSaasDlpSitePolicyDevice);
    $('get-tab-list').addEventListener('click', doGetTabList);
    doGetFeatureFlagStates();
    doGetIrmAvailable();
    doGetMamDlpAvailable();
    doGetMdatpAvailable();
    doGetMdatpWebSiteAvailable();
    doGetWipAvailable();
    doGetSaasDlpAvailable();
    doGetMipAvailable();
}
async function doGetFeatureFlagStates() {
    const featureFlags = await browser.getFeatureStatus();
    const featureToElement = [
        ['featureFlagDataProtection', 'wip'],
        ['featureFlagEndpointDlp', 'mdatp'],
        ['featureFlagWebSiteDlp', 'mdatp-website'],
        ['featureFlagWebSiteDlpv2', 'mdatp-website-v2'],
        ['featureFlagWebSiteDlpMac', 'mdatp-website-mac'],
        ['featureFlagMdatpEgressPaste', 'mdatp-egress-paste'],
        ['featureFlagMdatpEgressPasteMac', 'mdatp-egress-paste-mac'],
        ['featureFlagIrm', 'irm'],
        ['featureFlagIrmv2', 'irm-v2'],
        ['featureFlagMamDlp', 'mam-dlp'],
        ['featureFlagMamDlpMac', 'mam-dlp-mac'],
        ['featureFlagSaasDlp', 'saas-dlp'],
        ['featureFlagLlmConsumerDlp', 'llm-consumer-dlp'],
        ['featureFlagLlmConsumerDlpBlocking', 'llm-consumer-dlp-blocking'],
        ['featureFlagMipLabels', 'mip'],
    ];
    for (const entry of featureToElement) {
        const element = `${entry[1]}-flag`;
        $(element).setAttribute('state', featureFlags[entry[0]] ? 'enabled' : 'disabled');
    }
}
async function doGetWipProcessState() {
    $('enlightenment').setAttribute('flags', 'pending');
    $('enlightenment').setAttribute('enlightenment', 'pending');
    $('enterprise-id').setAttribute('enterprise-id', 'pending');
    const processState = await browser.getProcessState();
    $('enlightenment').setAttribute('flags', processState.flags);
    if (processState.enlightenment && processState.enlightenment.length > 0) {
        $('enlightenment')
            .setAttribute('enlightenment', processState.enlightenment);
        $('enlightenment').textContent = processState.enlightenment;
    }
    else {
        $('enlightenment').setAttribute('enlightenment', 'N/A');
        $('enlightenment').textContent = 'N/A';
    }
    if (processState.id && processState.id.length > 0) {
        $('enterprise-id').setAttribute('enterprise-id', processState.id);
        $('enterprise-id').textContent = processState.id;
    }
    else {
        $('enterprise-id').setAttribute('enterprise-id', 'N/A');
        $('enterprise-id').textContent = 'N/A';
    }
}
function setFeatureAvailability(feature, available) {
    $(`${feature}-feature`).setAttribute('state', available ? 'available' : 'unavailable');
}
async function doGetIrmAvailable() {
    const irmIsAvailable = await browser.getIrmAvailable();
    setFeatureAvailability('irm', irmIsAvailable);
}
async function doGetMamDlpAvailable() {
    const mamIsAvailable = await browser.getMamDlpAvailable();
    setFeatureAvailability('mam-dlp', mamIsAvailable);
    if (mamIsAvailable) {
        $('mam-dlp-settings').setAttribute('aria-hidden', 'false');
        $('mam-dlp-settings').style.display = 'block';
        $('policies-section').setAttribute('aria-hidden', 'false');
        $('policies-section').style.display = 'block';
        doGetMamDlpPolicies();
    }
    else {
        $('mam-dlp-settings').setAttribute('aria-hidden', 'true');
        $('mam-dlp-settings').style.display = 'none';
    }
}
async function doGetMdatpAvailable() {
    const mdatpIsAvailable = await browser.getMdatpAvailable();
    setFeatureAvailability('mdatp', mdatpIsAvailable);
    if (mdatpIsAvailable) {
        $('mdatp-access-check').setAttribute('aria-hidden', 'false');
        $('mdatp-access-check').style.display = 'block';
        $('utilities-section').setAttribute('aria-hidden', 'false');
        $('utilities-section').style.display = 'block';
    }
    else {
        $('mdatp-access-check').setAttribute('aria-hidden', 'true');
        $('mdatp-access-check').style.display = 'none';
    }
}
async function doGetMipAvailable() {
    const mipIsAvailable = await browser.getMipAvailable();
    setFeatureAvailability('mip', mipIsAvailable);
}
async function doGetMdatpWebSiteAvailable() {
    $('mdatp-website-feature').setAttribute('mdatp-website-state', 'pending');
    const mdatpWebSiteIsAvailable = await browser.getMdatpWebSiteAvailable();
    setFeatureAvailability('mdatp-website', mdatpWebSiteIsAvailable);
    if (mdatpWebSiteIsAvailable) {
        $('mdatp-access-check').setAttribute('aria-hidden', 'false');
        $('mdatp-access-check').style.display = 'block';
        $('utilities-section').setAttribute('aria-hidden', 'false');
        $('utilities-section').style.display = 'block';
    }
    else {
        $('mdatp-website-policy-table').setAttribute('aria-hidden', 'true');
        $('mdatp-website-policy-table').style.display = 'none';
    }
}
async function doGetWipAvailable() {
    const wipIsAvailable = await browser.getWipAvailable();
    setFeatureAvailability('wip', wipIsAvailable);
    if (wipIsAvailable) {
        $('wip-host-trust').setAttribute('aria-hidden', 'false');
        $('wip-host-trust').style.display = 'block';
        $('wip-policy-settings').setAttribute('aria-hidden', 'false');
        $('wip-policy-settings').style.display = 'block';
        $('utilities-section').setAttribute('aria-hidden', 'false');
        $('utilities-section').style.display = 'block';
        $('policies-section').setAttribute('aria-hidden', 'false');
        $('policies-section').style.display = 'block';
        doGetWipProcessState();
        doGetDataProtectionPoliciesJSON();
        doGetNetworkIsolationPoliciesJSON();
    }
    else {
        $('wip-host-trust').setAttribute('aria-hidden', 'true');
        $('wip-host-trust').style.display = 'none';
        $('wip-policy-settings').setAttribute('aria-hidden', 'true');
        $('wip-policy-settings').style.display = 'none';
    }
}
async function doCheckWipHostTrust() {
    const host = $('wip-host-trust').querySelector('input').value;
    if (host && host.length > 0) {
        const out = $('wip-host-trust').querySelector('#trust');
        out.textContent = 'pending...';
        try {
            const trust = await browser.getWipHostTrust(host);
            out.textContent = trust || kErrorText;
        }
        catch (trustError) {
            // An empty base::Value() is normally returned on error
            console.error('Failed to determine trust level of (' + host + ')');
            out.textContent = kErrorText;
        }
    }
}
async function doCheckMdatpAccess() {
    $('enforcement-level').textContent = 'pending...';
    $('policy-rule-id').textContent = 'pending...';
    $('policy-version').textContent = 'pending...';
    const host = $('mdatp-url-or-host-name').value;
    const path = $('mdatp-file-path').value;
    const access = await browser.getMdatpAccessCheck(host, path);
    if (access) {
        $('enforcement-level').textContent = access.enforcementLevel;
        $('policy-rule-id').textContent = access.policyRuleId;
        $('policy-version').textContent = access.policyVersion;
        if (access.outputUrl) {
            $('mdatp-url-or-host-name').value = access.outputUrl;
        }
    }
    else {
        $('enforcement-level').textContent = kErrorText;
        $('policy-rule-id').textContent = '';
        $('policy-version').textContent = '';
    }
}
function createPolicyTable(tableElement, policies) {
    // add the headers
    const tableHeading1 = document.createElement('th');
    tableHeading1.textContent = 'Policy Name';
    const tableHeading2 = document.createElement('th');
    tableHeading2.textContent = 'Policy Value';
    const headingRow = document.createElement('tr');
    headingRow.appendChild(tableHeading1);
    headingRow.appendChild(tableHeading2);
    tableElement.appendChild(headingRow);
    // add the policies
    for (const [policyName, policyValue] of policies) {
        const divName = document.createElement('div');
        const row = document.createElement('tr');
        const tdPolicy = document.createElement('td');
        divName.textContent = policyName;
        row.appendChild(tdPolicy);
        tdPolicy.appendChild(divName);
        const divValue = document.createElement('div');
        const tdValue = document.createElement('td');
        divValue.textContent = policyValue;
        row.appendChild(tdValue);
        tdValue.appendChild(divValue);
        tableElement.appendChild(row);
    }
}
async function doCheckMdatpFilePolices() {
    const mdatpFilePoliciesResponse = $('mdatp-file-policies-results');
    mdatpFilePoliciesResponse.style.display = 'block';
    mdatpFilePoliciesResponse.replaceChildren();
    const pending = document.createElement('p');
    pending.textContent = 'pending...';
    mdatpFilePoliciesResponse.appendChild(pending);
    const path = $('mdatp-policies-file-path').value;
    try {
        const mdatpFilePolicies = await browser.getMdatpFilePolicies(path);
        const mdatpPolicyMap = new Map(Object.entries(mdatpFilePolicies));
        if (mdatpPolicyMap.size === 0) {
            mdatpFilePoliciesResponse.replaceChildren();
            const errorParagraph = document.createElement('p');
            errorParagraph.textContent = 'No policies found for ' + path;
            mdatpFilePoliciesResponse.appendChild(errorParagraph);
        }
        else {
            mdatpFilePoliciesResponse.replaceChildren();
            const mdatpPolicyTable = document.createElement('table');
            createPolicyTable(mdatpPolicyTable, mdatpPolicyMap);
            mdatpFilePoliciesResponse.appendChild(mdatpPolicyTable);
        }
    }
    catch (error) {
        mdatpFilePoliciesResponse.replaceChildren();
        const errorParagraph = document.createElement('p');
        errorParagraph.textContent = `${error}`;
        mdatpFilePoliciesResponse.appendChild(errorParagraph);
    }
}
async function doCheckMdatpUrlPolices() {
    const mdatpWebSitePoliciesResponse = $('mdatp-website-policies-results');
    mdatpWebSitePoliciesResponse.style.display = 'block';
    mdatpWebSitePoliciesResponse.replaceChildren();
    const pending = document.createElement('p');
    pending.textContent = 'pending...';
    mdatpWebSitePoliciesResponse.appendChild(pending);
    const url = $('mdatp-policies-url').value;
    try {
        const mdatpUrlPolicies = await browser.getMdatpWebSitePolicies(url);
        mdatpWebSitePoliciesResponse.replaceChildren();
        const mdatpPolicyMap = new Map(Object.entries(mdatpUrlPolicies));
        if (mdatpPolicyMap.size === 0) {
            const noPolicies = document.createElement('p');
            noPolicies.textContent = 'There are no Purview Dlp policies for ' + url;
            mdatpWebSitePoliciesResponse.appendChild(noPolicies);
        }
        else {
            const mdatpPolicyTable = document.createElement('table');
            createPolicyTable(mdatpPolicyTable, mdatpPolicyMap);
            mdatpWebSitePoliciesResponse.appendChild(mdatpPolicyTable);
        }
    }
    catch (error) {
        mdatpWebSitePoliciesResponse.replaceChildren();
        const errorParagraph = document.createElement('p');
        errorParagraph.textContent = `${error}`;
        mdatpWebSitePoliciesResponse.appendChild(errorParagraph);
    }
}
async function doGetDataProtectionPoliciesJSON() {
    try {
        const dataProtectionPolicies = await browser.getDataProtectionPoliciesJSON();
        const dataProtectionPoliciesMap = new Map(Object.entries(dataProtectionPolicies));
        if (dataProtectionPoliciesMap.size === 0) {
            const noPolicies = document.createElement('p');
            noPolicies.textContent = 'There are no data protection policies to show.';
            $('DataProtection-results').appendChild(noPolicies);
        }
        else {
            const dataProtectionPolicyTable = document.createElement('table');
            createPolicyTable(dataProtectionPolicyTable, dataProtectionPoliciesMap);
            $('DataProtection-results').appendChild(dataProtectionPolicyTable);
        }
    }
    catch (error) {
        alert(`failed: ${error}`);
        const noPolicies = document.createElement('p');
        noPolicies.textContent = 'There are no data protection policies to show.';
        $('DataProtection-results').appendChild(noPolicies);
    }
}
async function doGetNetworkIsolationPoliciesJSON() {
    try {
        const networkIsolationPolicies = await browser.getNetworkIsolationPoliciesJSON();
        const networkIsolationPoliciesMap = new Map(Object.entries(networkIsolationPolicies));
        if (networkIsolationPoliciesMap.size === 0) {
            const noPolicies = document.createElement('p');
            noPolicies.textContent = 'There are no data protection policies to show.';
            $('NetworkIsolation-results').appendChild(noPolicies);
        }
        else {
            const networkIsolationPolicyTable = document.createElement('table');
            createPolicyTable(networkIsolationPolicyTable, networkIsolationPoliciesMap);
            $('NetworkIsolation-results').appendChild(networkIsolationPolicyTable);
        }
    }
    catch (error) {
        alert(`failed: ${error}`);
        const noPolicies = document.createElement('p');
        noPolicies.textContent = 'There are no data protection policies to show.';
        $('NetworkIsolation-results').appendChild(noPolicies);
    }
}
async function doGetMamDlpPolicies() {
    const pendingState = 'Pending...';
    $('mam-dlp-edge-identity').textContent = pendingState;
    $('mam-dlp-printing').textContent = pendingState;
    $('mam-dlp-receive').textContent = pendingState;
    $('mam-dlp-transmit').textContent = pendingState;
    $('mam-dlp-ccp').textContent = pendingState;
    try {
        const policies = await browser.getMamDlpPolicies();
        if (policies) {
            $('mam-dlp-edge-identity').textContent = policies.userName;
            $('mam-dlp-printing').textContent = policies.printingPolicy;
            $('mam-dlp-receive').textContent = policies.receivePolicy;
            $('mam-dlp-transmit').textContent = policies.transmitPolicy;
            $('mam-dlp-ccp').textContent = policies.cutCopyPastePolicy;
        }
        else {
            const noPolicyState = 'No policy defined.';
            $('mam-dlp-edge-identity').textContent = 'None';
            $('mam-dlp-printing').textContent = noPolicyState;
            $('mam-dlp-receive').textContent = noPolicyState;
            $('mam-dlp-transmit').textContent = noPolicyState;
            $('mam-dlp-ccp').textContent = noPolicyState;
        }
    }
    catch (error) {
        const errorState = 'No policy available (error).';
        console.error('Exception getting MAM DLP policies: ', error);
        $('mam-dlp-printing').textContent = errorState;
        $('mam-dlp-receive').textContent = errorState;
        $('mam-dlp-transmit').textContent = errorState;
        $('mam-dlp-ccp').textContent = errorState;
    }
}
async function doGetSaasDlpAvailable() {
    const available = await browser.getSaasDlpAvailable();
    setFeatureAvailability('saas-dlp', available);
    if (available) {
        $('saas-dlp-section').setAttribute('aria-hidden', 'false');
        $('saas-dlp-section').style.display = 'block';
        $('utilities-section').setAttribute('aria-hidden', 'false');
        $('utilities-section').style.display = 'block';
    }
    else {
        $('saas-dlp-section').style.display = 'none';
        $('saas-dlp-section').setAttribute('aria-hidden', 'true');
    }
}
async function getSaasDlpSitePolicyDevice() {
    getSaasDlpSitePolicy(true);
}
async function getSaasDlpSitePolicyProfile() {
    getSaasDlpSitePolicy(false);
}
async function getSaasDlpSitePolicy(forDevice) {
    let url = $('saas-dlp-site').value;
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    // Reset results.
    $('saas-cache').setAttribute('state', 'pending');
    const policies = [
        'download',
        'upload',
        'copy-cut',
        'paste',
        'print',
        'devtools',
        'network-request',
        'network-response',
        'native-app',
    ];
    for (const policy of policies) {
        $(`saas-${policy}-policy`).setAttribute('action', 'pending');
    }
    try {
        // Get results.
        const result = forDevice ?
            await browser.getSaasDlpSitePolicyDevice(url) :
            await browser.getSaasDlpSitePolicyProfile(url);
        if (result.policies) {
            // Render results.
            $('saas-cache').setAttribute('state', result.sync ? 'sync' : 'cached');
            for (const policy of policies) {
                const action = policy in result.policies ? result.policies[policy] : 'none';
                $(`saas-${policy}-policy`).setAttribute('action', action);
            }
        }
        else {
            // No results.
            $('saas-cache').setAttribute('state', 'none');
            for (const policy of policies) {
                $(`saas-${policy}-policy`).setAttribute('action', 'none');
            }
        }
    }
    catch (error) {
        alert(`failed: ${error}`);
    }
}
async function doGetTabList() {
    try {
        const tabList = await browser.getTabItems();
        const tabListElement = $('tab-list');
        tabListElement.replaceChildren();
        for (const tab of tabList) {
            const tabElement = document.createElement('button');
            tabElement.className = 'collapsible';
            tabElement.textContent = tab.url;
            tabElement.addEventListener('click', function () {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content) {
                    content.style.display = content.style.display === 'block'
                        ? 'none' : 'block';
                }
            });
            tabListElement.appendChild(tabElement);
            const contentElement = document.createElement('div');
            contentElement.className = 'collapsibleContent';
            if (tab.hasPolicies) {
                if (tab.mamPolicy) {
                    const mamElement = document.createElement('div');
                    const mamHeaderElement = document.createElement('h3');
                    mamHeaderElement.textContent = 'MAM Policies';
                    mamElement.appendChild(mamHeaderElement);
                    const mamTableElement = document.createElement('table');
                    const mamPolicyMap = new Map();
                    mamPolicyMap.set('Username', tab.mamPolicy.userName);
                    mamPolicyMap.set('Printing', tab.mamPolicy.printingPolicy);
                    mamPolicyMap.set('Receive', tab.mamPolicy.receivePolicy);
                    mamPolicyMap.set('Transmit', tab.mamPolicy.transmitPolicy);
                    mamPolicyMap.set('CutCopyPaste', tab.mamPolicy.cutCopyPastePolicy);
                    createPolicyTable(mamTableElement, mamPolicyMap);
                    mamElement.appendChild(mamTableElement);
                    contentElement.appendChild(mamElement);
                }
                if (tab.mdaPolicy) {
                    const saasElement = document.createElement('div');
                    const saasHeaderElement = document.createElement('h3');
                    saasHeaderElement.textContent = 'SaaS Policies:';
                    saasElement.appendChild(saasHeaderElement);
                    const saasTableElement = document.createElement('table');
                    const saasPolicyMap = new Map();
                    saasPolicyMap.set('Download', tab.mdaPolicy.download || 'none');
                    saasPolicyMap.set('Upload', tab.mdaPolicy.upload || 'none');
                    saasPolicyMap.set('CopyCut', tab.mdaPolicy['copy-cut'] || 'none');
                    saasPolicyMap.set('Paste', tab.mdaPolicy.paste || 'none');
                    saasPolicyMap.set('Print', tab.mdaPolicy.print || 'none');
                    saasPolicyMap.set('Devtools', tab.mdaPolicy.devtools || 'none');
                    saasPolicyMap.set('NativeApp', tab.mdaPolicy['native-app'] || 'none');
                    createPolicyTable(saasTableElement, saasPolicyMap);
                    saasElement.appendChild(saasTableElement);
                    contentElement.appendChild(saasElement);
                }
                if (tab.mdatpPolicy) {
                    const mdatpElement = document.createElement('div');
                    const mdatpHeaderElement = document.createElement('h3');
                    mdatpHeaderElement.textContent = 'Purview Dlp';
                    mdatpElement.appendChild(mdatpHeaderElement);
                    const mdatpTableElement = document.createElement('table');
                    const mdatpPolicyMap = new Map(Object.entries(tab.mdatpPolicy));
                    createPolicyTable(mdatpTableElement, mdatpPolicyMap);
                    mdatpElement.appendChild(mdatpTableElement);
                    contentElement.appendChild(mdatpElement);
                }
                if (tab.mipPolicy) {
                    const mipElement = document.createElement('div');
                    const mipHeaderElement = document.createElement('h3');
                    mipHeaderElement.textContent =
                        'Microsoft Information Protection Sensitivity Label';
                    mipElement.appendChild(mipHeaderElement);
                    const mipTableElement = document.createElement('table');
                    const mipPolicyMap = new Map(Object.entries(tab.mipPolicy));
                    createPolicyTable(mipTableElement, mipPolicyMap);
                    mipElement.appendChild(mipTableElement);
                    contentElement.appendChild(mipElement);
                }
                if (tab.wipPolicy) {
                    const wipElement = document.createElement('div');
                    const wipHeaderElement = document.createElement('h3');
                    wipHeaderElement.textContent = 'WIP Policy';
                    wipElement.appendChild(wipHeaderElement);
                    const wipPolicyElement = document.createElement('p');
                    wipPolicyElement.textContent = `${tab.wipPolicy}`;
                    wipElement.appendChild(wipPolicyElement);
                    contentElement.appendChild(wipElement);
                }
                if (tab.irmPolicy) {
                    const irmElement = document.createElement('h3');
                    irmElement.textContent = 'IRM Policy is on.';
                    contentElement.appendChild(irmElement);
                }
            }
            else {
                const noPolicyElement = document.createElement('div');
                noPolicyElement.textContent = 'No Policy in effect for this tab.';
                contentElement.appendChild(noPolicyElement);
            }
            tabListElement.appendChild(contentElement);
        }
    }
    catch (error) {
        alert(`failed: ${error}`);
    }
}
document.addEventListener('DOMContentLoaded', addListeners);
