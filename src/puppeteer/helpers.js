function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function initialOrgRequest(url, sid) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
      "symbol": sid,
      "search": "",
      "pagesize": 1,
      "page": 1
  });

  const requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "follow"
  };

  try {
      const response = await fetch(url, requestOptions);
      return await response.text();
  } catch (error) {
      console.error('Error in initialOrgRequest:', error);
      throw error;
  }
}

async function orgMemberRequest(url, sid, page) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
      "symbol": sid,
      "search": "",
      "pagesize": 32,
      "page": page
  });

  const requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "follow"
  };

  try {
      const response = await fetch(url, requestOptions);
      return await response.text();
  } catch (error) {
      console.error('Error in orgMemberRequest:', error);
      throw error;
  }
}

function parseForCitizens(htmlString) {
  const pattern = /href="(\/citizens\/[^"]+)">/g;
  const matches = [];
  let match;

  while ((match = pattern.exec(htmlString)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

async function getOrgAndPages(orgMembersEndpoint, orgSID) {
  const initialResponse = await initialOrgRequest(orgMembersEndpoint, orgSID);
  if (!initialResponse) {
    console.error('Failed to get initial response');
    return;
  }
  let parsedObject;
  try {
    parsedObject = JSON.parse(initialResponse);
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    return;
  }
  if (parsedObject.success !== 1) {
    console.error('Request was not successful. Aborting further processing.');
    return;
  }

  if (!parsedObject.data || !parsedObject.data.totalrows || !parsedObject.data.html) {
    console.error('Response is missing expected data');
    return;
  }
  const totalRows = parseInt(parsedObject.data.totalrows);
  if (isNaN(totalRows)) {
    console.error('Invalid totalrows value');
    return;
  }
  const pages = Math.ceil(totalRows / 32);
  console.log('Number of pages:', pages);

  return pages
}

async function getOrgMembersList(orgMembersEndpoint, orgSID, orgPages) {
  let page = 1;
  let nameList = [];
  
  while (page <= orgPages) {
    const memberRequest = await orgMemberRequest(orgMembersEndpoint, orgSID, page);
    const parsedMemberObject = JSON.parse(memberRequest);
    const htmlContent = parsedMemberObject.data.html;
    const matches = parseForCitizens(htmlContent);
    await delay(1000);
    page += 1;
    nameList = [...nameList, ...matches];    
  }
  
  return nameList;
}

  module.exports = {
    delay,
    getOrgMembersList,
    getOrgAndPages,
    initialOrgRequest,
    orgMemberRequest,
    parseForCitizens
  };