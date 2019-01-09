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

        this.changeValues = this.changeValues.bind(this);

        this.state = {
            venueOutline: ""
        };
    }

    async componentDidMount() {
        let data = await fetch(`/api/v1/get_test_data`).then(re => re.json());
        
        let b: Builder = new Builder(data, this.refs["3d-view-container"] as HTMLDivElement);

        this.builder = b;
    }

    changeValues() {
        this.builder.setVenueColor(parseInt(this.venueOutline, 16));
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
                    <button className="btn-default" onClick={this.changeValues}>Save</button>
                </aside>
                <div ref="3d-view-container" id="geo3d-view-container" />
            </Layout>
        );
    }
}