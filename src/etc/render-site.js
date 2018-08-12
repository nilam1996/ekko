import React from "react";
import ReactDOMServer from "react-dom/server";
import fse from "fs-extra";
import {
  fetchPublicPage,
  fetchPublicPageForPreview,
  fetchPublicPageByHostname
} from "@/controllers/pages/get";
import Layout from "@/themes/layouts/default";

export default async (
  { params: { facebookPageID }, query: { theme: themeID, preview } },
  res
) => {
  try {
    const site = await fetchSite({ facebookPageID, themeID, preview });
    const html = await render(site);
    return res.send(html);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const fetchSite = async ({ facebookPageID, themeID, preview }) => {
  const args = {
    id: facebookPageID,
    themeId: themeID || false
  };
  return preview
    ? await fetchPublicPageForPreview(args)
    : await fetchPublicPage(args);
};

const render = async ({ page, theme }) => {
  const { name } = theme;
  const themePath = `../themes/${name}`;
  const Theme = await import(`${themePath}/js/layout`);
  const themeClient = await fse.readFile(
    `${__dirname}/../themes/${name}/js/built.js`,
    "utf-8"
  );
  const themeCSS = await fse.readFile(
    `${__dirname}/../themes/${name}/css/app.css`,
    "utf-8"
  );
  const html = ReactDOMServer.renderToString(
    <Layout css={themeCSS} data={page.data} clientJS={themeClient}>
      <Theme doc={page} />
    </Layout>
  );
  return html;
};

const fetchSiteByHostname = async ({ req, res, hostname }) => {
  try {
    const site = await fetchPublicPageByHostname({ hostname });
    const html = await render(site);
    return res.send(html);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { fetchSiteByHostname };
export { fetchSite };
export { render };
