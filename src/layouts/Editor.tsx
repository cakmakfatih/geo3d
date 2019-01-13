import * as React from "react";
import './Editor.css';
import Builder from './../builder/Builder';
import Layout from './../components/Layout';
import { Link } from 'react-router-dom';
import Config from './../config.json';

export default class Editor extends React.Component<{}, {
    menu: string;
    objects: Array<any>;
}> {
    
    builder: Builder;
    lastMenu: string;
    reader: FileReader;
    lastReadFile: any;
    project: any;

    constructor(props: any) {
        super(props);

        this.project = new Object();

        this.project.projectName = new String();
        this.project.projectDescription = new String();

        let objects = new Array<any>();

        this.state = {
            menu: "START",
            objects
        };

        this.reader = new FileReader();
        this.reader.onload = this.readGeoJSON;
    }

    guid = (): string => {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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

    readFile = async (e: any, ext: string) => {
        if(e.target.files.length === 1) {
            let file = e.target.files[0];
            let fileExtArr = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name) : undefined;

            if(typeof fileExtArr !== "undefined") {
                let fileExt = fileExtArr[0];

                if(fileExt === ext || fileExt === "json") {
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
            return {
                status: "error",
                error: "Unexpected format in the provided data."
            };
        }
    }

    isGeo3D = (d: any) => {
        if(typeof d.coordinates !== "undefined" && typeof d.id !== "undefined" && typeof d.objects !== "undefined" && typeof d.projectName !== "undefined" && typeof d.projectDescription !== "undefined") {
            return {
                "status": "success"
            };
        } else {
            // unexpected format
            return {
                status: "error",
                error: "Unexpected format in the provided data."
            };
        }
    }

    readGeo3D = async (e: any) => {
        let { objects } = this.state;

        if(!(objects.length === 0)) {
            this.setState({
                objects: new Array<any>()
            });
        }

        let res = await this.readFile(e, "geo3d");
        
        if(res.status === "success") {
            let isGeo3D = this.isGeo3D(res.data);

            if(isGeo3D.status === "success") {
                this.openProject(res.data);
            } else {
                throw new Error(isGeo3D.error);
            }
        } else {
            throw new Error(res.error);
        }
    }

    readVenue = async (e: any) => {
        let { objects } = this.state;

        if(!(objects.length === 0)) {
            this.setState({
                objects: new Array<any>()
            });
        }

        let res = await this.readFile(e, "geojson");
        
        if(res.status === "success") {
            let isVenue = this.isVenue(res.data);
            
            if(isVenue.status === "success") {
                let id = this.guid();

                objects.push({data: res.data, type3d: "3D_POLYGON", name: "VENUE", id, level: 0, settings: {extrude: Config.extrudeSettings, material: {sideColor: Config.sideColor, color: Config.defaultColor}} });

                this.setState({
                    objects
                });
            } else {
                throw new Error(isVenue.error);
            }
        } else {
            throw new Error(res.error);
        }
    }

    getProjectData = () => {
        return {...this.project, objects: this.state.objects};
    }

    createProject = () => {
        let projectId = this.guid();
        let { objects } = this.state;

        this.project = {
            ...this.project,
            id: projectId
        };

        if(objects.length > 0 && this.project.projectName.length > 0) {
            this.changeMenu("PROJECT_MENU");
            this.builder = new Builder(this.refs["3d-view-container"] as HTMLDivElement);

            let offsetCoords = objects.find(i => i.type3d === "3D_POLYGON").data.features.find((i: any) => typeof i.properties.DISPLAY_XY !== "undefined").properties.DISPLAY_XY.coordinates;

            this.project.coordinates = {lat: offsetCoords[0], lon: offsetCoords[1]};
            
            this.builder.openProject(this.getProjectData());
        } else {
            throw new Error("You can't create a project without providing a valid venue data and a name.");
        }
    }

    openProject = (data: any) => {
        let { 
            projectName,
            projectDescription,
            id,
            objects,
            coordinates
        } = data;

        this.setState({
            objects
        });

        this.project = { projectName, projectDescription, coordinates, id };

        this.changeMenu("PROJECT_MENU");
        this.builder = new Builder(this.refs["3d-view-container"] as HTMLDivElement);
        
        this.builder.openProject(this.getProjectData());
    }

    renderMenu = (): JSX.Element => {
        let { menu } = this.state;

        switch(menu) {
            case "START":
                return this.startMenu();
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

    validateEntered = () => {
        let { objects } = this.state; 
        let { value } = (this.refs["manual-geojson"] as any);
        
        try {
            let data = JSON.parse(value);
            let isVenue = this.isVenue(data);
            
            if(isVenue.status === "success") {
                let id = this.guid();

                objects.push({data, type3d: "3D_POLYGON", name: "VENUE", id, level: 0,settings: {extrude: Config.extrudeSettings, material: {sideColor: Config.sideColor, color: Config.defaultColor}}});

                this.setState({
                    menu: "NEW_MODEL_1",
                    objects
                });
            } else {
                throw new Error(isVenue.error);
            }
        } catch(e) {
            throw new Error(e);
        }
    }

    startMenu = (): JSX.Element => {
        return (
            <aside className="aside">
                <section className="aside-top">
                    <div className="form-group">
                        <button className="btn-default btn-bordered" onClick={() => this.changeMenu("NEW_MODEL_1")}>
                            <i className="fas fa-plus"></i>
                            NEW
                        </button>
                    </div>
                    <div className="form-group">
                        <label htmlFor="up-v" className="btn-default btn-bordered">
                            <i className="fas fa-upload"></i>
                            OPEN
                        </label>
                        <input type="file" ref="up-v" id="up-v" className="upload-default" onChange={this.readGeo3D} />
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
                        this.project.projectName = new String();
                        this.project.projectDescription = new String();
                        this.setState({
                            menu: "START",
                            objects: new Array<any>()
                        });
                    }}>
                        <i className="fas fa-chevron-left"></i>
                        <span>BACK</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className="label-default">Project Name (*)</label>
                        <input type="text" className="inp-default" onChange={(e) => this.project.projectName = e.target.value} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className="label-default">Project Description</label>
                        <textarea rows={5} className="inp-default" onChange={(e) => this.project.projectDescription = e.target.value} />
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

    projectMenu = () => {
        return (
            <aside className="aside">
                <section className="aside-top">

                </section>
                <button className="btn-default" onClick={() => window.location.reload()}>
                    TO MAIN MENU
                </button>
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