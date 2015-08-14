/**
 * Copyright (c) 2015, Cornellapp.
 * All rights reserved.
 *
 * This source code is licensed under the GNU General Public License v3.0
 * license found in the LICENSE file in the root directory of this source
 * tree.
 *
 *
 * CAModalSignup renders inside of CAModal and represents the signup view.
 * Component styles are located in _CAModalSignup.scss.
 */

var React = require('react/addons'),
    ModalActions = require('../actions/ModalActions'),
    _ = require('underscore');

var CAModalSignup = React.createClass({
    getInitialState: function() {
        return {
            loading: false,
            errorMessage: ''
        };
    },

    /**
     * Fill in the name field from the netid if the name field is empty and not
     * in focus. Feels like magic.
     */
    autoFillName: function(name) {
        var nameField = React.findDOMNode(this.refs.nameField);
        if (!$(nameField).is(':focus') && !$.trim(nameField.value).length)
            nameField.value = name;
    },

    render: function() {
        var errorMessage,
            submitButtonClass = classNames('ca-red-button', {
                loading: this.state.loading
            });

        if (this.state.errorMessage)
            errorMessage = (
                <p className="error-message">
                    {this.state.errorMessage}
                </p>
            );

        return (
            <div className="ca-modal-signup">
                <h3>Sign up with Cornellapp</h3>
                <form ref="form" onSubmit={this._onLogin}>
                    <div className="input-group">
                        <input className="ca-clear-input" type="text"
                            ref="netidField" placeholder="NetID"
                            onKeyDown={this._onKeyDown}
                            onBlur={this._onBlurNetid} required />
                        <input className="ca-clear-input" type="password"
                            placeholder="Password" onKeyDown={this._onKeyDown}
                            required/>
                        <input className="ca-clear-input" type="text"
                            ref="nameField" placeholder="Full Name"
                            onKeyDown={this._onKeyDown} required/>
                    </div>
                    {errorMessage}
                    <div className="button-group">
                        <button className={submitButtonClass}
                            onClick={this._onSignup}
                            ref="submit">
                            <span className="label">Sign Up</span>
                            <div className="spin-loader">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </button>
                        <button className="ca-simple-button condensed"
                            onClick={this._onLogin}>
                            Or Log In Instead
                        </button>
                    </div>
                </form>
            </div>
        );
    },

    /**
     * Event handler for logging in instead.
     */
    _onLogin: function() {
        e.preventDefault();
        ModalActions.login();
    },

    /**
     * Event handler for blurring the Netid field. Auto-fills the full name
     * field.
     */
    _onBlurNetid: function(e) {
        var netidValue = React.findDOMNode(this.refs.netidField).value,
            nameValue = React.findDOMNode(this.refs.nameField).value;

        // Skip if the netid field is empty or the name field is not empty.
        if (!$.trim(netidValue).length || $.trim(nameValue).length)
            return;

        $.ajax({
            url: '/api/fetch-name',
            data: { netid: netidValue },
            success: _.bind(function(name) {
                if (name.length)
                    this.autoFillName(name);
            }, this)
        });
    },

    /**
     * Event handler for pressing down a key.
     */
    _onKeyDown: function(e) {
        if (e.key === 'Enter')
            React.findDOMNode(this.refs.submit).click();
    },

    /**
     * Event handler for attempting a sign up.
     */
    _onSignup: function(e) {
        e.preventDefault();

        // Prevent double submitting.
        if (this.state.loading)
            return;

        var form = React.findDOMNode(this.refs.form);

        this.jqXHR = $.ajax({
            type: 'post',
            url: '/api/signup',
            data: $(form).serializeObject(),
            success: this.receiveLoginResponse
        });

        this.setState({
            loading: true
        });
    }
});

module.exports = CAModalSignup;