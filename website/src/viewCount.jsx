import React, { Component } from "react"
import axios from 'axios';

// tracker is an axios instance wired to the tracking url. The application is
// going to assume the tracking URL in order to remove the need to define
// environment variables in the website directory.
const tracker = axios.create({
  baseURL: `https://hits.${window.location.hostname}/`,
  timeout: 1000,
});

class ViewCount extends Component {
  constructor(props) {
    super(props)
 	  this.state = { count: 0 };
  }

  async componentDidMount () {
    try {
      const res = await tracker.get(window.location.pathname);
      this.setState({ count: res.data.count });
    } catch(error) {
      console.log(error)
    }
  }

  render () {
    return (<div id="count">{this.state.count}</div>);
  }
}

export default ViewCount;
