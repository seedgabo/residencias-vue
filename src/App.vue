<template>
  <v-app id="example-2" standalone>
    <v-navigation-drawer temporary v-model="drawer" overflow>
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
    <v-toolbar prominent fixed class="blue accent-5" v-if="api.user.id" dark>
      <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
      <!-- <v-btn icon v-tooltip:bottom="{ html: api.trans('literals.events') }">
                                                                                              <v-icon>event</v-icon>
                                                                                            </v-btn>

                                                                                            <v-btn icon v-tooltip:bottom="{ html: api.trans('literals.dynamic_documents') }">
                                                                                              <v-icon>insert_drive_file</v-icon>
                                                                                            </v-btn>

                                                                                            <v-btn icon v-tooltip:bottom="{ html: api.trans('literals.invoices') }">
                                                                                              <v-icon>account_balance_wallet</v-icon>
                                                                                            </v-btn> -->

      <v-spacer>
        <div class="text-xs-center">
          <v-toolbar-title>
            <img src="./assets/logo.png" class="hidden-md-and-up logo" @click="navigate('/')">
            <img src="./assets/logo-completo.png" class="hidden-sm-and-down logo" @click="navigate('/')">
          </v-toolbar-title>
        </div>
      </v-spacer>

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
import Echo from 'laravel-echo'
window.Pusher = require('pusher-js');
window.io = require('socket.io-client')

export default {
  mounted() {
    this.api.ready.then((data) => {
      this.getData()
      this.startEcho()
    })
      .catch((err) => {
        console.error(err);
        this.navigate('/login');
      });
  },
  data() {
    return {
      drawer: false,
      pages: [
        { icon: 'home', title: 'home', url: '/' },
        { icon: 'account_balance_wallet', title: 'invoices', 'url': 'invoices' },
        { icon: 'person', title: 'profile', url: 'profile' },
        { icon: 'event', title: 'events', 'url': 'events' },
        { icon: 'insert_drive_file', title: 'documents', 'url': 'documents' },
      ],
      api: require('./services/api.js')
    }
  },
  methods: {
    getData() {
      this.api.get('getData')
        .then((response) => {
          console.log(response.data)
          this.api.residence = response.data.residence;
        })
        .catch(console.error)
    },
    startEcho() {
      if (this.api.Echo) {
        console.warn('already started Echo');
        return;
      }
      this.api.Echo = new Echo({
        key: '807bbfb3ca20f7bb886e',
        authEndpoint: this.api.url + 'broadcasting/auth',
        broadcaster: 'socket.io', // pusher o socket.io
        host: this.api.user.hostEcho,
        auth:
        {
          headers:
          {
            'Auth-Token': this.api.user.token,
          }
        }

      });
      this.api.Echo.private('Application')
        /*

        .listen('ParkingCreated', (data) => {
          console.log("created parking:", data);
          this.zone.run(() => {
            data.parking.user = data.user;
            data.parking.residence = data.residence;
            this.parkings[this.parkings.length] = data.parking;
          })
        })
        .listen('ParkingUpdated', (data) => {
          console.log("updated parking:", data);
          var parking = this.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          this.zone.run(() => {
            data.parking.user = data.user;
            data.parking.residence = data.residence;
            if (parking >= 0) {
              this.parkings[parking] = data.parking;

            }
            else {
              this.parkings[this.parkings.length] = data.parking;
            }
          });
        })
        .listen('ParkingDeleted', (data) => {
          console.log("deleted parking:", data);
          var parking = this.parkings.findIndex((parking) => {
            return parking.id === data.parking.id;
          });
          this.zone.run(() => {
            if (parking >= 0) {
              this.parkings.splice(parking, 1);
            }
          })
        })

        .listen('VisitorCreated', (data) => {
          console.log("created visitor:", data);
          if (data.visitor.residence_id != this.residence.id) return;
          this.zone.run(() => {
            var visitor = this.visitors[this.visitors.length] = data.visitor;
            if (data.image)
              visitor.image = data.image;
          })
        })
        .listen('VisitorUpdated', (data) => {
          console.log("updated visitor:", data);
          if (data.visitor.residence_id != this.residence.id) return;
          var visitor_index = this.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          this.zone.run(() => {
            if (visitor_index > -1)
              var visitor = this.visitors[visitor_index] = data.visitor;
            else {
              var visitor = this.visitors[this.visitors.length] = data.visitor;
            }
            if (data.image) {
              visitor.image = data.image;
            }
          });
        })
        .listen('VisitorDeleted', (data) => {
          console.log("deleted visitor:", data);
          var visitor = this.visitors.findIndex((visitor) => {
            return visitor.id === data.visitor.id;
          });
          this.zone.run(() => {
            if (visitor >= 0) {
              this.visitors.splice(visitor, 1);
            }
          })
        })


        .listen('VisitCreated', (data) => {
          if (data.visitor.residence_id != this.residence.id) return;
          console.log("created vist:", data);

          this.zone.run(() => {
            this.visits.unshift(data.visit);
            var visit = this.visits[0];
            if (data.visitor)
              visit.visitor = data.visitor;
            this.visitStatus(visit);
          })
        })
        .listen('VisitUpdated', (data) => {
          console.log("updated visit:", data);
          if (data.visitor.residence_id != this.residence.id) return;
          this.events.publish('VisitUpdated', data);
          var visit_index = this.visits.findIndex((visit) => {
            return visit.id === data.visit.id;
          });
          this.zone.run(() => {
            if (visit_index > -1)
              var visit = this.visits[visit_index] = data.visit;
            else {
              this.visits.unshift(data.visit);
              var visit = this.visits[0];
            }
            if (data.visitor) {
              visit.visitor = data.visitor;
            }
            this.visitStatus(visit);

          });
        })
        .listen('VisitDeleted', (data) => {
          console.log("deleted visitor:", data);
          if (data.visitor.residence_id != this.residence.id) return;

          var visit = this.visits.findIndex((visit) => {
            return visit.id === data.visit.id;
          });
          this.zone.run(() => {
            if (visit >= 0) {
              this.visits.splice(visit, 1);
            }
          })
        })

        */

        .listen('EventCreated', (data) => {
          if (!(data.event.privacity == "public" || data.residence.id == this.api.user.residence_id)) return;
          console.log("created event:", data);
          this.api.events[this.api.events.length] = data.event

          if (data.event.privacity == 'private') {
            data.event.borderColor = "red";
          } else {
            data.event.borderColor = "lime";
          }
          data.event.className = data.event.type;
          this.$router.app.$emit('eventCreated', data.event)
        })
        .listen('EventUpdated', (data) => {
          console.log("updated event:", data);
          if (!(data.event.privacity == "public" || data.residence.id == this.api.user.residence_id)) return;
          var event_index = this.api.events.findIndex((ev) => {
            return ev.id === data.event.id;
          });
          if (event_index > -1)
            this.api.events[event_index] = data.event;
          else
            this.api.events[this.api.events.length] = data.event

          if (data.event.privacity == 'private') {
            data.event.borderColor = "red";
          } else {
            data.event.borderColor = "lime";
          }
          data.event.className = data.event.type;

          this.$router.app.$emit('eventChanged', data.event)
        })
        .listen('EventDeleted', (data) => {
          console.log("deleted event:", data);
          var event = this.visits.findIndex((visit) => {
            return event.id === data.event.id;
          });
          if (event >= 0) {
            this.visits.splice(event, 1);
          }
        })

      this.api.Echo.private('App.Residence.' + this.api.user.residence_id)
        .listen('VisitConfirm', (data) => {
          console.log("VisitConfirm: ", data);
          this.newVisit(data.visit, data.visitor);
        })

      this.api.Echo.private('App.User.' + this.api.user.id)
        .notification((notification) => {
          console.log(notification);
        });

      this.api.Echo.join('App.Mobile')
        .here((data) => {
          console.log("here:", data);
        })
        .joining((data) => {
          console.log("joining", data);
        })
        .leaving((data) => {
          console.log("leaving", data);
        })
    },
    stopEcho() {
      this.api.Echo.leave('Application');
      this.api.Echo.leave('App.User.' + this.api.user.id);
      this.api.Echo.leave('App.Residence.' + this.api.user.residence_id);
      this.api.Echo.leave('App.Mobile');
      this.api.Echo = undefined;
    },
    navigate(uri) {
      this.$router.push(uri)
    },
    logout() {
      this.api.user = {};
      window.localStorage.clear();
      this.$router.push('/login')
    },

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
  .logo
    height 55px
    margin-top 5px
    cursor pointer
    transition all .4s
    &:hover
      height 70px
</style>
