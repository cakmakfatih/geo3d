import * as React from "react";
import './Editor.css';
import Builder from './../builder/Builder';
import Layout from './../components/Layout';
import { Link } from 'react-router-dom';

export default class Editor extends React.Component<{}, {
    menu: string;
}> {
    
    builder: Builder;
    lastMenu: string;
    projectName: string;
    venueColor: string;
    objects: any[];
    reader: FileReader;
    lastReadFile: any;

    constructor(props: any) {
        super(props);

        this.state = {
            menu: "START"
        };

        this.projectName = "";

        this.reader = new FileReader();
        this.reader.onload = this.readGeoJSON;
    }

    async componentDidMount() {
        this.objects = new Array<any>();
    }

    sleep = (ms: number): Promise<Function> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    changeMenu = (menu: string) => {
        this.lastMenu = this.state.menu;

        this.setState({
            menu
        });
    }

    readGeoJSON = (e: any) => {
        try {
            let data = JSON.parse(e.target.result);
            this.lastReadFile = { status: "success", data: data };
        } catch(e) {
            return {
                status: "error",
                error: e
            };
        }
    }

    fetchData = async (): Promise<JSON> => {
        if(typeof this.lastReadFile !== "undefined") {
            let d = this.lastReadFile;
            this.lastReadFile = undefined;

            return d;
        } else {
            await this.sleep(300);
            return this.fetchData();
        }
    }

    readFile = async (e: any) => {
        if(e.target.files.length === 1) {
            let file = e.target.files[0];
            let fileExtArr = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name) : undefined;

            if(typeof fileExtArr !== "undefined") {
                let fileExt = fileExtArr[0];

                if(fileExt === "geojson" || fileExt === "json") {
                    this.reader.readAsText(file);
                    let result: any = await this.fetchData();
                    
                    return result;
                } else {
                    // unexpected file type
                    return {
                        status: "error",
                        error: "Unexpected file type."
                    };
                }
            } else {
                // unexpected error
                return {
                    status: "error",
                    error: "Unexpected error."
                };
            }
        } else {
            // more than 1 file
            return {
                status: "error",
                error: "You can only upload 1 file"
            };
        }
    }

    isVenue = (d: any) => {
        if(typeof d.features !== "undefined" && typeof d.features[0] !== "undefined") {
            if(typeof d.features[0].properties !== "undefined") {
                if(typeof d.features[0].properties.DISPLAY_XY !== "undefined" && typeof d.features[0].properties.DISPLAY_XY.coordinates !== "undefined") {
                    return {
                        status: "success"
                    };
                } else {
                    // not a venue file
                    return {
                        status: "error",
                        error: "Venue file's {features} array must contain {DISPLAY_XY} in it's {properties}."
                    };
                }
            } else {
                // unexpected geojson data
                return {
                    status: "error",
                    error: "File is formatted in a bad shape."
                };
            }
        } else {
            // unexpected format
            console.log();
            return {
                status: "error",
                error: "Unexpected format in the provided data."
            };
        }
    }

    readVenue = async (e: any) => {
        if(!(this.objects.length === 0)) {
            this.objects = [];
        }
        let res = await this.readFile(e);
        
        if(res.status === "success") {
            let isVenue = this.isVenue(res.data);
            
            if(isVenue.status === "success") {
                this.objects.push({...res.data, type3d: "VENUE"});
                console.log(this.objects[0]);
            } else {
                console.log(isVenue.error);
            }
        } else {
            console.log(res.error);
        }
    }

    renderMenu = (): JSX.Element => {
        switch(this.state.menu) {
            case "START": {
                return this.asideEnter();
            }
            case "NEW_MODEL_1":
                return this.newModel1();
            case "MANUAL_GEOJSON":
                return this.manualGeoJSON();
            case "PROJECT_MENU":
                return this.projectMenu();
            default: {
                break;
            }
        }
    }

    asideEnter = (): JSX.Element => {
        return (
            <aside className="aside">
                <section className="aside-top">
                    <div className="form-group">
                        <button className="btn-default btn-bordered" onClick={() => this.changeMenu("NEW_MODEL_1")}>NEW</button>
                        <button className="btn-default btn-bordered">OPEN</button>
                    </div>
                </section>
                <Link to="/" className="btn-default btn-bordered">
                    EXIT
                </Link>
            </aside>
        );
    }

    newModel1 = (): JSX.Element => {
        return (
            <aside className="aside">
                <section className="aside-top">
                    <div className="btn-back" onClick={() => {
                        this.objects = [];
                        this.projectName = "";
                        this.setState({
                            menu: "START"
                        });
                    }}>
                        <i className="fas fa-chevron-left"></i>
                        <span>BACK</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className="label-default">Project Name (*)</label>
                        <input type="text" className="inp-default" onChange={(e) => this.projectName = e.target.value} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className="label-default">Project Description</label>
                        <textarea rows={5} className="inp-default" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="up-v" className="btn-default">
                            <i className="fas fa-upload"></i>
                            Venue GeoJSON
                        </label>
                        <input type="file" ref="up-v" id="up-v" className="upload-default" onChange={this.readVenue} />
                    </div>
                    <div className="form-group">
                        <span className="link-span" onClick={() => this.setState({menu: "MANUAL_GEOJSON"})}>Alternatively, you can manually enter GeoJSON data</span>
                    </div>
                </section>
                <button className="btn-default btn-bordered" onClick={() => this.createProject()}>
                    NEXT
                </button>
            </aside>
        );
    }

    validateEntered = () => {
        let { value } = (this.refs["manual-geojson"] as any);
        
        try {
            let data = JSON.parse(value);
            let isVenue = this.isVenue(data);
            
            if(isVenue.status === "success") {
                this.objects.push({...data, type3d: "VENUE"});
                this.setState({
                    menu: "NEW_MODEL_1"
                });
            } else {
                console.log(isVenue.error);
            }
        } catch(e) {
            console.log(e);
        }
    }

    manualGeoJSON = (): JSX.Element => {
        return (
            <aside className="aside">
                <section className="aside-top">
                    <div className="btn-back" onClick={() => this.setState({menu: "NEW_MODEL_1"})}>
                        <i className="fas fa-chevron-left"></i>
                        <span>BACK</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className="label-default">Venue GeoJSON</label>
                        <textarea rows={12} className="inp-default" ref="manual-geojson" />
                    </div>
                </section>
                <button className="btn-default" onClick={this.validateEntered}>
                    SAVE
                </button>
            </aside>
        );
    }

    createProject = () => {
        if(this.objects.length > 0 && this.projectName.length > 0) {
            this.changeMenu("PROJECT_MENU");
            this.builder = new Builder(this.refs["3d-view-container"] as HTMLDivElement);
            
            let offsetCoords = this.objects.find(i => i.type3d === "VENUE").features.find((i: any) => typeof i.properties.DISPLAY_XY !== "undefined").properties.DISPLAY_XY.coordinates;

            this.builder.setOffsets(offsetCoords);
            this.builder.processData(this.objects[0]);
        } else {
            console.log("You can't create a project without providing a valid venue data and a name.");
        }
    }

    projectMenu = () => {
        return (
            <aside className="aside">
                <section className="aside-top">
                    <div className="btn-back" onClick={() => this.setState({menu: "NEW_MODEL_1"})}>
                        <i className="fas fa-chevron-left"></i>
                        <span>BACK</span>
                    </div>
                </section>
            </aside>
        );
    }
    
    render = () => {
        return (
            <Layout flexDirection="row">
                {this.renderMenu()}
                <div ref="3d-view-container" id="geo3d-view-container" />
            </Layout>
        );
    }
}