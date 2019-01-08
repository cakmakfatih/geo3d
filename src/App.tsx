import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from './layouts/Home';
import Editor from './layouts/Editor';


class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Route path='/' component={Home} exact />
                    <Route path='/editor' component={Editor} exact />
                </div>
            </BrowserRouter>
        );
    }
}

export default App;