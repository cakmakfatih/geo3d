import * as React from "react";
import { NavLink } from "react-router-dom";
import './Header.css';

export default () => (
    <header>
        <h1 className="title">
            Geo3D
        </h1>
        <NavLink to='/' activeClassName="active" exact>Home</NavLink>
        <NavLink to='/editor' activeClassName="active" exact>Editor</NavLink>
    </header>
);