import * as React from "react";
import Layout from './../components/Layout';
import Header from './../components/Header';

export default class Home extends React.Component {
    render = () => {
        return (
            <Layout>
                <Header />
            </Layout>
        );
    }
}