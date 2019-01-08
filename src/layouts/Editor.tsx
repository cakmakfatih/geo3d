import * as React from "react";
import './Editor.css';
import Builder from './../builder/Builder';
import Layout from './../components/Layout';
import { Link } from 'react-router-dom';

export default class Editor extends React.Component<{}, { 
    builder: Builder,
    venueOutline: string
    }> {
    
    constructor(props: any) {
        super(props);
        this.state = {
            builder: null,
            venueOutline: ""
        };
    }

    async componentDidMount() {
        let data = await fetch(`/api/v1/get_test_data`).then(re => re.json());
        
        let b: Builder = new Builder(data, this.refs["3d-view-container"] as HTMLDivElement);

        this.setState({
            builder: b
        });
    }

    flipHexString(hexValue: string, hexDigits: number) {
        var h = hexValue.substr(0, 2);
        for (var i = 0; i < hexDigits; ++i) {
          h += hexValue.substr(2 + (hexDigits - 1 - i) * 2, 2);
        }
        return h;
      }
      
      
      hexToFloat(hex: number): number {
        var s = hex >> 31 ? -1 : 1;
        var e = (hex >> 23) & 0xFF;
        return s * (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2, 23) * Math.pow(2, (e - 127))
      }
    
    render() {
        return (
            <Layout flexDirection="row">
                <aside className="aside">
                    <section className="aside-top">
                        <Link to='/'><i className="fas fa-chevron-left"></i></Link>
                        <div className="form-group">
                            <label htmlFor="" className="label-default">Venue Outline</label>
                            <input type="text" maxLength={6} placeholder="Hex" className="inp-default" />
                        </div>
                    </section>
                    <button className="btn-default" onClick={() => this.state.builder.setVenueColor(0xff2020)}>Save</button>
                </aside>
                <div ref="3d-view-container" id="geo3d-view-container" />
            </Layout>
        );
    }
}