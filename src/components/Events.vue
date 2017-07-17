<template>
  <v-container fluid>
    <!--//* Calendar  -->
    <v-layout wrap style="height:90%">
      <v-flex style="height:90%;" xs12 sm12 md9>
        <v-card>
          <v-card-text>
            <full-calendar ref="calendar" id="calendar" :events="api.events" :config="config" @event-selected="eventSelected"></full-calendar>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <!--//* end Calendar -->

    <!--//* EDITOR  -->
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark class="primary">
          <v-btn icon @click.native="dialog=false" dark>
            <v-icon>event</v-icon>
          </v-btn>
          <v-toolbar-title>{{event._title}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click.native="dialog=false ">
              <v-icon class="white--text "> close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container fluid>
            <v-layout wrap>
              <v-flex xs12 sm6 offset-sm3>
                <v-text-field v-model="event.title" :label="api.trans( 'literals.title') " prepend-icon="title "></v-text-field>
              </v-flex>
              <v-flex sm3 class="hidden-xs-only"></v-flex>

              <v-flex xs6 sm6>
                <v-menu :close-on-content-click="true" v-model="menu_start_date_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.start_date')" v-model="event.start_date" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="event.start_date" scrollable></v-date-picker>
                </v-menu>

                <v-menu :close-on-content-click="false" v-model="menu_start_time_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.start_date')" v-model="event.start_time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="event.start_time" scrollable></v-time-picker>
                </v-menu>
              </v-flex>

              <v-flex xs6 sm6>
                <v-menu :close-on-content-click="true" v-model="menu_end_date_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans('literals.end_date')" v-model="event.end_date" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="event.end_date" scrollable></v-date-picker>
                </v-menu>

                <v-menu :close-on-content-click="false" v-model="menu_end_time_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.end_date')" v-model="event.end_time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="event.end_time" scrollable></v-time-picker>
                </v-menu>

              </v-flex>

              <v-flex xs12 sm4>
                <v-select prepend-icon="lock" v-bind:items="privacities" v-model="event.privacity " :label="api.trans('literals.privacity')" autocomplete></v-select>
              </v-flex>

              <v-flex xs12 sm4>
                <v-select prepend-icon="nature_people" v-bind:items="types" v-model="event.type " :label="api.trans('literals.type')" autocomplete></v-select>
              </v-flex>

              <v-flex xs12 sm4>
                <v-select prepend-icon="place" v-bind:items="zones" item-text="name" item-value="id" v-model="event.zones" :label="api.trans('literals.zones')" multiple></v-select>
              </v-flex>

              <v-flex xs12 sm6 offset-sm3>
                <v-text-field multi-line v-model="event.description" :label="api.trans( 'literals.description') " prepend-icon="list"></v-text-field>
              </v-flex>

            </v-layout>
            <v-btn fixed bottom right primary dark fab @click.native="saveEvent()">
              <v-icon dark>save</v-icon>
              <!-- &nbsp; {{api.trans('crud.save')}} -->
            </v-btn>
          </v-container>
        </v-card-text>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--//* END EDITOR  -->
  </v-container>
</template>

<script>
const axios = require('axios')
window.moment = require('moment')
window.__ = require('underscore')._
moment.locale('es')
var api = require('../services/api.js')
export default {
  name: 'Example',
  mounted() {
    this.$router.app.$on('eventChanged', (data) => {
      console.log("event changed", data);
      this.refreshEvents();
    });
    this.api.ready
      .then(() => {
        this.getEvents()
        this.getZones()
      })
  },
  beforeDestroy() {
    this.$router.app.$off('eventChanged')
  },
  data() {
    return {
      dialog: false,
      api: api,
      event: {},
      events: [],
      zones: [],
      config: {
        locale: 'es',
        defaultView: 'month',
        height: 'auto',
      },
      menu_start_date_picker: false,
      menu_start_time_picker: false,
      menu_end_date_picker: false,
      menu_end_time_picker: false,
      menu: false,
      privacities: [
        { text: api.trans('__.public'), value: 'public' },
        { text: api.trans('__.private'), value: 'private' },
      ],
      types: [
        { text: api.trans("__.no specified"), value: "no specified" },
        { text: api.trans("__.party"), value: "party" },
        { text: api.trans("__.reunion"), value: "reunion" },
        { text: api.trans("__.meeting"), value: "meeting" },
        { text: api.trans("__.expose"), value: "expose" },
        { text: api.trans("__.wedding"), value: "wedding" },
        { text: api.trans("__.birthday"), value: "birthday" },
        { text: api.trans("__.funeral"), value: "funeral" },
      ]
    }
  },
  methods: {
    eventSelected: function (event, jsEv, view) {
      this.event = {
        id: event.id,
        _title: event.title,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        start_date: event.start.format('YYYY-MM-DD'),
        start_time: event.start.format('HH:mma'),
        privacity: event.privacity,
        visibility: event.visibility,
        color: event.color,
        type: event.type,
        zones: window.__.pluck(event.zones, 'id'),
        allDay: event.allDay,
        user: event.user,
        user_id: event.user_id
      }
      if (event.end) {
        this.event.end_date = event.end.format('YYYY-MM-DD')
        this.event.end_time = event.end.format('HH:mma')
      }
      else {
        this.event.end_date = event.start.add(1, 'day').format('YYYY-MM-DD')
        this.event.end_time = event.start.add(1, 'day').format('HH:mma')
      }
      console.log(this.event)
      setTimeout(() => {
        this.dialog = true
      }, 10)
    },
    getEvents: function () {
      this.api.get("events?limit=500&order[start]=desc&with[]=user&with[]=zones&afterEach[toCalendar]=null")
        .then((response) => {
          console.log(response.data)
          this.api.events = response.data
        })
        .catch(console.error)
    },
    getZones: function () {
      this.api.get("zones")
        .then((response) => {
          console.log(response.data)
          this.zones = response.data
        })
        .catch(console.error)
    },
    saveEvent: function () {
      this.event.start = moment.utc(this.event.start_date + " " + this.event.start_time, "YYYY-MM-DD HH:mma")
      this.event.end = moment.utc(this.event.end_date + " " + this.event.end_time, "YYYY-MM-DD HH:mma")
      delete this.event._tile
      delete this.event.start_date
      delete this.event.start_time
      delete this.event.end_date
      delete this.event.end_time
      delete this.event.user
      console.log(this.event)
      this.api.put('events/' + this.event.id, this.event)
        .then((response) => {
          this.api.events.filter((ev) => {
            ev.id === response.id
          })
          console.log(response.data)
        })
        .catch(console.error)
      this.dialog = false;
    },
    refreshEvents: function () {
      setTimeout(() => {
        if (this.$refs.calendar)
          this.$refs.calendar.$emit('reload-events')
      }, 100)
    },
  }
}
</script>


<!-- Add"scoped" attribute to limit CSS to this component only -->
<style>
@import '~fullcalendar/dist/fullcalendar.css';

#calendar {
  padding-top: 30px;
}

#calendar h2 {
  font-size: 1.5rem;
  text-transform: uppercase;
  line-height: 35px;
}

#calendar .fc-day-header {
  text-transform: uppercase;
  font-weight: 400;
}

#external-events {
  padding-top: 50px;
}

#external-events .fc-event {
  color: #fff;
  text-decoration: none;
  padding: 5px;
  margin-bottom: 10px;
  cursor: all-scroll;
  border: none;
}

.fc button {
  background: #fff;
}

.fc-day-number {
  color: #039be5;
}

.fc td,
.fc th {
  border-width: 0px !important;
}

.fc-state-active,
.fc-state-down {
  color: #ff4081 !important;
}

.bottom {
  position: absolute;
  bottom: 1px;
}
</style>
