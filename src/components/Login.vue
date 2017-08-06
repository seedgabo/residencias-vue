<template>
  <div class="login-page">
    <v-container fluid>
      <v-layout class="text-xs-center">
        <v-flex>
          <img class=" delay bounceIn animated" src="../assets/logo-completo.png" alt="" style="height:90px;">
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex class="hidden-xs"></v-flex>
        <v-flex>
          <v-card class="login-card mt-5" hover raised>
            <v-card-title primary-title>
              <div class="text-center" style="width:100%">
                <h4 class="headline">
                  Login
                </h4>
                <v-text-field name="username" v-model="username" label="username" prepend-icon="account_circle"> </v-text-field>

                <v-text-field name="password" v-model="password" label="password" prepend-icon="lock" :append-icon="e1 ? 'visibility' : 'visibility_off'" :append-icon-cb="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'">
                </v-text-field>
                <v-btn @click.native="doLogin()" :loading="loging" primary block v-bind:disabled="password.length <4 || username.length <4">
                  Login
                </v-btn>

                <fb-signin-button :params="fbSignInParams" @success="onFacebookSignInSuccess" @error="onSignInError">
                  <v-btn primary flat>
                    <v-icon class="blue--text">fa-facebook-square</v-icon>
                    &nbsp;&nbsp;Facebook
                  </v-btn>
                </fb-signin-button>

                <g-signin-button :params="googleSignInParams" @success="onGoogleSignInSuccess" @error="onSignInError">
                  <v-btn danger flat>
                    <v-icon class="red--text">fa-google-plus-square</v-icon>
                    <span class="red--text">
                      &nbsp;&nbsp;Google
                    </span>
                  </v-btn>
                </g-signin-button>

              </div>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex class=" hidden-xs"></v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
const axios = require('axios')
export default {
  name: 'login',
  data() {
    return {
      api: require('../services/api.js'),
      username: 'seedgabo@gmail.com ',
      password: '',
      e1: true,
      loging: false,
      fbSignInParams: {
        scope: 'email,public_profile,user_birthday',
        return_scopes: true
      },
      googleSignInParams: {
        client_id: '425679220353-u39prig4hkrjg592lnppmnbfj6lvi4qk.apps.googleusercontent.com'
      }
    }
  },
  methods: {
    doLogin() {
      this.loging = true;
      axios.get(this.api.url + 'login', {
        headers: { 'Authorization': "Basic " + btoa(this.username + ':' + this.password) }
      })
        .then((response) => {
          this.api.ready = new Promise((resolve, reject) => {
            console.log(response.data);
            this.loging = false;
            this.api.setUser(response.data)
            window.localStorage.setItem('user', JSON.stringify(response.data.user));
            window.localStorage.setItem('residence', JSON.stringify(response.data.residence));
            this.getLangs();
            resolve(response.data)
            this.$router.push('/');
            this.$router.app.$emit('login', response.data)
          })
        })
        .catch((err) => {
          console.error(err);
        })
    },
    getLangs() {
      this.api.get('lang')
        .then((response) => {
          console.log(response.data);
          this.api.i18n = response.data;
          window.localStorage.setItem('i18n', JSON.stringify(response.data));
        })
        .catch(console.error)
    },
    onFacebookSignInSuccess(response) {
      FB.api('/me', { fields: 'name,birthday,email,link,gender,picture' }, (fuser) => {
        console.log(fuser)
        this.SocialLogin(fuser);
        console.log(`Good to see you, ${fuser.name}.`)
      })
    },
    onGoogleSignInSuccess(googleUser) {
      const profile = googleUser.getBasicProfile()
      console.log(profile);
      var user = {
        name: profile.getName(),
        image: profile.getImageUrl(),
        email: profile.getEmail(),
        google_id: profile.getId(),
      }
      this.SocialLogin(user)
    },
    onSignInError(error) {
      console.log('OH NOES', error)
    },
    SocialLogin(user) {
      this.loging = true;
      axios.post(this.api.url + 'login/oauth', { email: user.email, user: user })
        .then((response) => {
          this.api.ready = new Promise((resolve, reject) => {
            console.log(response.data);
            this.loging = false;
            this.api.setUser(response.data)
            window.localStorage.setItem('user', JSON.stringify(response.data.user));
            window.localStorage.setItem('residence', JSON.stringify(response.data.residence));
            this.getLangs();
            resolve(response.data)
            this.$router.push('/');
            this.$router.app.$emit('login', response.data)
          })
        })
        .catch((err) => {
          console.error(err);
        })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login-page,
body {
  background: #fff;
  margin-top: 0px;
  height: 100vh;
  width: 100vw;
  background-image: url(https://s-media-cache-ak0.pinimg.com/originals/d2/b8/fc/d2b8fc669367ac5eac78f9f2d4186913.png);
  background-size: cover;
}

.delay {
  animation-delay: 1s;
}
</style>
