import * as React from "react";
import './Editor.css';
import Builder from './../builder/Builder';
import Layout from './../components/Layout';
import { Link } from 'react-router-dom';

export default class Editor extends React.Component {
    
    builder: Builder;
    venueOutline: string;

    constructor(props: any) {
        super(props);

        this.saveChanges = this.saveChanges.bind(this);
    }

    async componentDidMount() {
        let venue = await fetch(`/api/v1/get_venue`).then(re => re.json());

        let b: Builder = new Builder(this.refs["3d-view-container"] as HTMLDivElement);

        this.builder = b;

        let offsetCoords = venue.features.find((i: any) => typeof i.properties.DISPLAY_XY !== "undefined").properties.DISPLAY_XY.coordinates;

        this.builder.setOffsets(offsetCoords);
        this.builder.processData(venue);

        let buildings = await fetch(`/api/v1/get_buildings`).then(re => re.json());
    }

    saveChanges() {
        this.venueOutline.length === 6 ? this.builder.setVenueColor(parseInt(this.venueOutline, 16)) : null;
    }
    
    render() {
        return (
            <Layout flexDirection="row">
                <aside className="aside">
                    <section className="aside-top">
                        <Link to='/'><i className="fas fa-chevron-left"></i></Link>
                        <div className="form-group">
                            <label htmlFor="" className="label-default">Venue Outline</label>
                            <input type="text" maxLength={6} placeholder="Hex" className="inp-default" onChange={(e) => this.venueOutline = e.target.value} />
                        </div>
                    </section>
                    <button className="btn-default" onClick={this.saveChanges}>Save</button>
                </aside>
                <div ref="3d-view-container" id="geo3d-view-container" />
            </Layout>
        );
    }
}