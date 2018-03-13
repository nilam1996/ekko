import Facebook from "@/etc/facebook";
import { Pages, Tracks, Themes, FacebookToken, Domains } from "@/services";
import ApiError from "@/etc/error";
import mail from "@/etc/mail";
import formatPageForDisplay from "@/etc/format-page-for-display";
import Slack from "@/etc/slack";

const get = {
  async fetchPublicPageForPreview({ id, themeId }) {
    const token = process.env.EKKO_FB_TOKEN;
    const facebook = new Facebook();
    const themes = new Themes();
    const themeObj = themeId
      ? await themes.getById(themeId)
      : await themes.getDefault();
    let page;
    try {
      page = await facebook.fetchPage(id, token, false, {
        preview: true
      });
    } catch (e) {
      throw new Error(e);
    }

    page = formatPageForDisplay(page);

    return {
      page,
      theme: themeObj,
      user: {
        full_user: true
      }
    };
  },
  async fetchPublicPageByURL({ url }) {
    const token = process.env.EKKO_FB_TOKEN;
    const facebook = new Facebook();
    let page;
    try {
      page = await facebook.fetchFBPageByURL(url, token);
    } catch (error) {
      throw new Error(error);
    }

    return {
      page
    };
  },
  async fetchPublicPage({ id, themeId }) {
    const pages = new Pages();
    const themes = new Themes();
    let page = await pages.getByFacebookId(id);
    if (!page) {
      return {
        page: null
      };
    }
    page = formatPageForDisplay(page);
    let theme = await themes.getById(themeId || page.ThemeId);
    if (!theme) {
      theme = await themes.getDefault();
    }
    return {
      page,
      theme
    };
  },
  async fetchPublicPageByHostname({ hostname, user }) {
    const pages = new Pages();
    const themes = new Themes();
    const domains = new Domains();
    const domain = await domains.getByDomain(hostname);
    if (!domain) {
      return {
        page: null
      };
    }
    let page = await pages.getById(domain.PageId, true);
    if (!page) {
      return {
        page: null
      };
    }
    const theme = await themes.getById(page.ThemeId);
    page = formatPageForDisplay(page);
    return {
      page,
      theme
    };
  },
  async fetchPages({ userId, user }) {
    const { facebookUserId } = user;
    if (!facebookUserId) {
      throw new ApiError(400, "Not connected to Facebook");
    }
    const pages = new Pages();
    const allPages = await pages.getByUserId(userId);
    return {
      pages: allPages.map(page => formatPageForDisplay(page))
    };
  },
  async refreshPages({ userId, facebookUserId }) {
    if (!facebookUserId) {
      throw new ApiError(400, "Not connected to Facebook");
    }
    const pages = new Pages();
    const facebookToken = new FacebookToken();
    const tokenObj = await facebookToken.getByUserId(userId);
    if (!tokenObj) {
      throw new ApiError(400, "Not connected to Facebook");
    }
    const facebookPages = await pages.fetchAndUpdateFromFacebook(
      tokenObj.token,
      facebookUserId,
      userId
    );
    return {
      facebookPages
    };
  },
  async fetchPage({ facebookPageId, user, access_token }) {
    const { id, facebookUserId } = user;
    const pages = new Pages();
    const themes = new Themes();
    const existing = await pages.getByUserId(id);
    if (existing.length) {
      throw new ApiError(
        400,
        "You already have a Facebook Page connected to Ekko"
      );
    }
    const fb = new Facebook(access_token, facebookUserId);
    const theme = await themes.getDefault();
    const facebookPage = await fb.fetchPage(facebookPageId, access_token);
    const userPage = await pages.updateOrCreatePage(facebookPage, id, theme);
    if (!userPage) {
      return {
        page: {}
      };
    }
    Slack.newPagePicked({
      userId: id,
      pageName: facebookPage.data.name,
      facebookPageId,
      siteURL: `http://sites.ekko.site/${facebookPageId}`
    });
    mail.send({
      to: user.email,
      type: "pagePicked",
      data: {
        siteURL: `http://sites.ekko.site/${facebookPageId}`,
        pageName: facebookPage.data.name
      }
    });
    return {
      page: formatPageForDisplay(userPage)
    };
  }
};

export default get;
