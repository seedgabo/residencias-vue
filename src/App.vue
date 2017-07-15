<template>
  <v-app id="example-2" standalone>
    <v-navigation-drawer temporary v-model="drawer" light overflow absolute>
      <v-list class="pa-0" v-if="api.user.id">
        <v-list-tile avatar tag="div" class="primary">
          <v-list-tile-avatar>
            <img :src="api.user.image_url" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title class="white--text">{{ api.user.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile @click.native="navigate(page.url)" v-for="(page,i) in pages" :key="i">
          <v-list-tile-action>
            <v-icon>{{ page.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="text-capitalize">{{ api.trans('literals.'+page.title) }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click.native="logout()">
          <v-list-tile-action>
            <v-icon fa>sign-out</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Cerrar Sesión</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>
    <v-toolbar prominent fixed class="blue accent-4" v-if="api.user.id" dark>
      <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
      <div>
        <v-toolbar-title>
          <img src="./assets/logo.png" class="hidden-md-and-up" alt="" style="height:55px; margin-top:5px">
          <img src="./assets/logo-completo.png" class="hidden-sm-and-down" alt="" style="height:55px; margin-top:5px">
        </v-toolbar-title>
      </div>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn flat slot="activator" style="height:100%; padding:8px 0px;">
            <img class="hidden-sm-and-down avatar small" :src="api.user.image_url">
            <span class="hidden-sm-and-down">
              {{api.user.name}}
            </span>
            <v-icon class="hidden-sm-and-down white--text">arrow_drop_down</v-icon>
            <v-icon class="hidden-md-and-up white--text" style="margin: 8px 0px; ">more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile avatar :href="api.url + '../admin'">
              <v-list-tile-avatar>
                <v-icon>lock</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title class="orange--text">Admin</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile avatar to="profile">
              <v-list-tile-avatar>
                <v-icon>person</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title class="primary--text text-capitalize">{{api.trans('literals.profile')}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile @click.native="logout()">
              <v-list-tile-avatar>
                <v-icon fa>sign-out</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title class="red--text">{{api.trans('literals.logout')}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
export default {
  mounted() {
    var user = window.localStorage.getItem('user');
    if (user) {
      this.api.user = JSON.parse(user);
      var residence = window.localStorage.getItem('residence');
      this.getLangs();
      if (residence) {
        this.api.residence = JSON.parse(residence);
      }
    } else {
      this.navigate('/login');
    }

  },
  data() {
    return {
      drawer: false,
      pages: [
        { icon: 'home', title: 'home', url: '/' },
        { icon: 'person', title: 'profile', url: 'profile' },
        { icon: 'event', title: 'events', 'url': 'events' },
      ],
      api: require('./services/api.js')
    }
  },
  methods: {
    navigate(uri) {
      this.$router.push(uri)
    },
    logout() {
      this.api.user = {};
      window.localStorage.clear();
      this.$router.push('/login')
    },
    getLangs() {
      this.api.get('lang')
        .then((response) => {
          console.log(response.data);
          this.api.i18n = response.data;
        })
        .catch(console.error)
    }
  }
}
</script>

<style lang="stylus">
  @import './stylus/main'
  .avatar
      border-radius: 50px
      margin: 0 6px
      &.small
        width: 40px
        height:40px
      &.medium
        width: 70px
        height 70px
  .text-capitalize
    text-transform:capitalize

</style>
