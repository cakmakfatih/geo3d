import * as React from "react";
import './Layout.css';

const Layout = (props: any) => (
    <div className="layout" style={{flexDirection: props.flexDirection || "column"}}>
        {
            props.children
        }
    </div>
);

export default Layout;