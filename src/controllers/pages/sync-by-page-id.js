import moment from 'moment'

import Facebook from './../../etc/facebook'
import services from './../../services/'
const { Users, Pages } = services
import { logger } from './../../etc/logger'
import formatPageForDisplay from './../../etc/format-page-for-display'

const syncByPageId = async ({ pageId }) => {
    const pages = new Pages()
    const users = new Users()
    const page = await pages.getByFacebookId(pageId)
    if(!page){
        logger.info('Page not found', pageId)
        return {}
    }
    if(page.lastFetchedFromFB) {
        const difference = moment().diff(moment(page.lastFetchedFromFB), 'minutes')
        if(difference < 1) {
            logger.info('Page fetched too recently', pageId)
            return {}
        }
    }
    const userId = page.UserId
    const user = await users.getById(userId)
    const facebook = new Facebook(page.access_token, user.get('facebookUserId'))
    let newPage
    newPage = await facebook.fetchPage(pageId)
    const updatedPage = await pages.updatePage(newPage)
    return formatPageForDisplay(updatedPage)
}

export default syncByPageId
