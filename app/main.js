/** @jsx React.DOM */

var React = require('react/addons'),
    DHApp = require('./components/DHApp'),
    mountNode = document.body;

React.render(React.createElement(DHApp), mountNode);