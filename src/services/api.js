const axios = require('axios')
var api = {
    url: 'http://localhost/residencias/public/api/',
    name: 'Residencias Online',
    user: {},
    residence: {},
    i18n: {},

    setUser: function(data) {
        api.user = data.user;
        api.residence = data.residence
            // localStorage.setItem('user', JSON.stringify(data.user));
    },

    get: function(uri) {
        return axios.get(this.url + uri, { headers: { 'Auth-Token': this.user.token } })
    },
    post: function(uri, data) {
        return axios.post(this.url + uri, data, { headers: { 'Auth-Token': this.user.token } })
    },
    put: function(uri, data) {
        return axios.post(this.url + uri, data, { headers: { 'Auth-Token': this.user.token } })
    },
    delete: function(uri) {
        return axios.delete(this.url + uri, { headers: { 'Auth-Token': this.user.token } })
    },

    trans: function(string, inputs = {}) {
        var trans = _.get(this.i18n, string);
        if (!trans) trans = string;
        for (var key in inputs) {
            trans = trans.replace(":" + key, inputs[key]);
        }
        return trans.replace('__.', '').replace('literals.', '');
    }
}
module.exports = api;