<template>
  <v-container fluid>
    <v-layout wrap style="height:90%">
      <v-flex style="height:90%;" xs12 sm12 md9>
        <v-card>
          <v-card-text>
            <full-calendar ref="calendar" id="calendar" :events="events" :config="config" @event-selected="eventSelected"></full-calendar>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition" :overlay="false">

      <v-card>
        <v-toolbar dark class="primary">
          <v-btn icon @click.native="dialog = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{event.title}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn flat @click.native="dialog = false">
              <v-icon class="white--text"> save</v-icon>
              {{api.trans('crud.save')}}</v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const axios = require('axios')
window.moment = require('moment')
moment.locale('es')
export default {
  name: 'Example',
  mounted() {
    this.api.ready
      .then(() => {
        this.getEvents()
      })
  },
  data() {
    return {
      dialog: false,
      api: require('../services/api.js'),
      event: {},
      events: [],
      config: {
        locale: 'es',
        defaultView: 'month',
        height: 'auto',
      }
    }
  },
  methods: {
    eventSelected: function (event, jsEv, view) {
      console.log(event)
      this.event = {
        title: event.title,
        start: event.start,
        end: event.end,
      }
      setTimeout(() => {
        this.dialog = true
      }, 10)
    },
    getEvents: function () {
      this.api.get("events?limit=500&order[start]=desc&afterEach[toCalendar]=null")
        .then((response) => {
          console.log(response.data)
          this.events = response.data
        })
        .catch(console.error)
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
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

.fc td,
.fc th {
  border-width: 0px !important;
}

.fc-state-active,
.fc-state-down {
  color: #ff4081 !important;
}
</style>
