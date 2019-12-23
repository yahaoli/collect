import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

let element;

class DownLoadExcel extends React.Component {
  static defaultProps = {
    method: "post"
  };

  render() {
    let { url, method, data } = this.props
      , value = encodeURI(JSON.stringify(data));
    return (
      <form method={method} action={url}>
        <input name='query' value={value} type="hidden"/>
      </form>
    );
  }
}

DownLoadExcel.propTypes = {
  url: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};
export default function(props) {
  if (element) {
    ReactDOM.unmountComponentAtNode(element);
    document.body.removeChild(element);
  }
  let div = document.createElement("div");
  div.className = "page-form";
  div.style.display = "none";
  element = div;
  document.body.appendChild(div);
  ReactDOM.render(React.createElement(
    DownLoadExcel,
    props
  ), div);
  element.getElementsByTagName("form")[0].submit();
};
