import React from 'react'

import Components from './../../components'
import Header from './header'
import Footer from './footer'

const {
    About,
    Cta,
    Events,
    Hours,
    Location,
    Name,
    Phone,
    Photos,
    Posts
} = Components

const style = {
    wrap: {
        borderColor: 'rgba(0,0,0,0.1)'
    }
}

export default class Standard extends React.Component {
    render() {

        const { about, cover, picture, name, location, hours, call_to_actions, events, posts, phone, photos, description } = this.props.doc.data

        console.log(this.props.doc.data)

        return (
            <div>
                <Header cover={cover} picture={picture} name={name} phone={phone} callToActions={call_to_actions} />
                <div className="max-width-4 mx-auto px4 pt4 pb2 bg-white border mb4" style={style.wrap}>
                    <About about={about} description={description} />
                    {(location && location.street || hours) && (
                        <div className="flex mx-auto max-width-4 justify-center border-bottom pb4" style={style.wrap}>
                            <Location location={location} />
                            <Hours hours={hours} />
                        </div>
                    )}
                    <Events events={(events || []).slice(0, 5)} />
                    <Posts posts={(posts || []).slice(0, 5)} />
                    {/*<Photos photos={photos.slice(0, 5)} />*/}
                    <Footer about={about} />
                </div>
            </div>
        )
    }
}
