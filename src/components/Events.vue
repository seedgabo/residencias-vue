<template>
  <v-container fluid>
    <!--//* Calendar  -->
    <v-layout wrap style="height:90%">
      <v-flex style="height:90%;" xs12 sm12 md9>
        <v-card>
          <v-card-text>
            <full-calendar ref="calendar" id="calendar" :events="api.events" :config="config" @event-selected="eventSelected" @day-click="dayClick"></full-calendar>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex class="hidden-sm-and-down" md3>
        <v-card>
          <v-card-title>
            <h3 class="headline primary--text">
              {{api.trans('__.next events')}}
            </h3>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for="event in nextEvents" v-bind:key="event.id" @click.stop="eventSelected(event,null,null)">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{event.title}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{event.start | moment('calendar') }}
                  </v-list-tile-sub-title>

                  <v-list-tile-sub-title>
                    <small>
                      {{ event.creator.name }}
                    </small>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-list-tile-action-text>
                    {{duration(event.start,event.end)}}
                  </v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
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
                  <v-date-picker v-model="event.start_date" locale="es" scrollable></v-date-picker>
                </v-menu>

                <v-menu :close-on-content-click="false" v-model="menu_start_time_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.start_date')" v-model="event.start_time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="event.start_time" locale="es" autosave></v-time-picker>
                </v-menu>
              </v-flex>

              <v-flex xs6 sm6>
                <v-menu :close-on-content-click="true" v-model="menu_end_date_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.end_date')" v-model="event.end_date" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="event.end_date" locale="es" scrollable></v-date-picker>
                </v-menu>

                <v-menu :close-on-content-click="false" v-model="menu_end_time_picker" transition="scale-transition" full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" :label="api.trans( 'literals.end_date')" v-model="event.end_time" prepend-icon="access_time" readonly></v-text-field>
                  <v-time-picker v-model="event.end_time" locale="es" autosave></v-time-picker>
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
                <v-text-field v-model="event.color" type="color" :label="api.trans('literals.color') " prepend-icon="brush"></v-text-field>
              </v-flex>

              <v-flex xs12 sm6>
                <v-text-field multi-line v-model="event.description" :label="api.trans( 'literals.description') " prepend-icon="list"></v-text-field>
              </v-flex>

            </v-layout>
            <v-btn :disabled="!canSave()" v-if="event.id" v-tooltip:top="{ html: api.trans('crud.save') }" fixed bottom right primary dark fab @click.native="saveEvent()">
              <v-icon dark>save</v-icon>
            </v-btn>

            <v-btn :disabled="!canSave()" v-else v-tooltip:top="{ html: api.trans('crud.add') }" fixed bottom right primary dark fab @click.native="saveNewEvent()">
              <v-icon dark>add_circle</v-icon>
            </v-btn>

            <v-btn v-if="event.id" v-tooltip:top="{html: api.trans('crud.delete')}" fixed bottom style="right:80px" class="red" dark fab @click.native="deleteEvent(event)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-container>
        </v-card-text>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--//* END EDITOR  -->

    <!--//* Visor  -->
    <v-dialog v-model="visor" width="600px" transition="dialog-bottom-transition">
      <v-card>
        <v-btn icon absolute right @click="visor=false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-card-text>
          <v-container fluid>
            <v-layout wrap>
              <v-flex xs12 sm12 class="text-xs-center">
                <h3 class="headline">{{event.title}}</h3>
              </v-flex>
              <v-flex xs12 sm6 v-if="event.start">
                <b>{{api.trans('__.date start')}}</b>: {{event.start.format('dddd, MMMM Do YYYY, h:mm:ss a')}}
              </v-flex>

              <v-flex xs12 sm6>
                <b>{{api.trans('__.date end')}}</b>:
                <span v-if="event.end">
                  {{event.end.format('dddd, MMMM Do YYYY, h:mm:ss a')}}
                </span>
                <span v-else>
                  <span>{{api.trans('literals.all_day')}}</span>
                </span>
              </v-flex>
              <v-flex xs12 sm7>
                <b>{{api.trans('literals.zones')}}:</b>
                <span v-for="zone in event.zones" :key="zone.id"> {{ zone.name}},</span>
              </v-flex>
              <v-flex xs12 sm5 v-if="event.creator" style="vertical-align: middle; align-items: top; display: inline-flex;">
                <img :src="event.creator.image_url" alt="" class="avatar small">
                <span style="margin-bottom:30px">
                  {{event.creator.name}}
                </span>
              </v-flex>
              <v-flex xs12 sm3 offset-sm9 :class="(event.privacity=='public'?'green':'red')+'--text'">
                <b>
                  {{api.trans('__.'+ event.privacity)}}
                </b>
              </v-flex>

            </v-layout>
          </v-container>
        </v-card-text>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--//* END Visor  -->

    <v-btn fab fixed right bottom dark primary @click="createEvent()" v-tooltip:left="{html: api.trans( 'crud.add') + ' ' + api.trans( 'literals.event')}">
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
const axios = require('axios')
window.moment = require('moment')
window.__ = require('underscore')._
moment.locale('es')
var api = require('../services/api.js')
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
export default {
  name: 'Example',
  mounted() {
    this.$router.app.$on('eventCreated', (data) => {
      console.log("event created", data);
      this.refreshEvents();
    });
    this.$router.app.$on('eventChanged', (data) => {
      console.log("event changed", data);
      this.refreshEvents();
    });
    this.$router.app.$on('eventDeleted', (data) => {
      console.log("event deleted", data);
      this.refreshEvents();
    });

    this.api.ready
      .then(() => {
        this.getEvents()
        this.getZones()
      })
  },
  beforeDestroy() {
    this.$router.app.$off('eventCreated')
    this.$router.app.$off('eventChanged')
    this.$router.app.$off('eventDeleted')
  },
  data() {
    return {
      dialog: false,
      visor: false,
      api: api,
      event: {},
      events: [],
      zones: [],
      config: {
        locale: 'es',
        defaultView: 'month',
        height: 'auto',
        customButtons: {
          addEvent: {
            text: api.trans('crud.add') + " " + api.trans('literals.event'),
            click: () => {
              this.createEvent()
            }
          }
        },
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        footer: {
          center: 'addEvent'
        },
        editable: false,
        select: this.createEvent
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
      event.start = moment(event.start)
      this.event = {
        id: event.id,
        _title: event.title,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        start_date: event.start.format('YYYY-MM-DD'),
        start_time: event.start.format('HH:mma'),
        end_time: event.start.format("HH:mma"),
        privacity: event.privacity,
        visibility: event.visibility,
        color: event.color,
        type: event.type,
        zones: event.residence_id == this.api.user.residence_id ? window.__.pluck(event.zones, 'id') : event.zones,
        allDay: event.allDay,
        residence_id: event.residence_id,
        residence: event.residence,
        creator: event.creator,
        creator_id: event.creator_id
      }
      if (event.end) {
        event.end = moment(event.end)
        this.event.end_date = event.end.format('YYYY-MM-DD')
        this.event.end_time = event.end.format('HH:mma')
      }
      else {
        this.event.end_date = event.start.clone().add(1, 'day').format('YYYY-MM-DD')
        this.event.end_time = event.start.clone().add(1, 'day').format('HH:mma')
      }
      console.log(this.event)
      setTimeout(() => {
        if (this.event.residence_id == this.api.user.residence_id)
          this.dialog = true
        else
          this.visor = true
      }, 30)
    },
    getEvents: function () {
      this.api.get("events?limit=500&order[start]=desc&with[]=creator&with[]=residence&with[]=zones&afterEach[toCalendar]=null")
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
    createEvent: function (start, end) {
      if (!start) {
        var start = moment().add(1, 'd')
      }
      if (!end) {
        var end = start.clone().add(1, 'd')
      }
      this.event = {
        _title: api.trans('crud.add') + " " + api.trans('literals.event'),
        title: '',
        description: '',
        start: start,
        end: end,
        start_date: start.format('YYYY-MM-DD'),
        start_time: start.format('HH:mma'),
        end_date: end.format("YYYY-MM-DD"),
        end_time: end.format("HH:mma"),
        privacity: 'public',
        visibility: 'public',
        color: getRandomColor(),
        type: 'party',
        zones: [],
        allDay: false,
        residence_id: this.api.user_residence_di,
        creator: this.api.user.id,
        creator_id: this.api.user.id
      }
      setTimeout(() => {

        this.dialog = true
      }, 200)

    },
    saveNewEvent: function () {
      this.event.start = moment.utc(this.event.start_date + " " + this.event.start_time, "YYYY-MM-DD HH:mma")
      this.event.end = moment.utc(this.event.end_date + " " + this.event.end_time, "YYYY-MM-DD HH:mma")
      this.event.creator_id = this.api.user.id
      this.event.residence_id = this.api.user.residence_id
      var event = JSON.parse(JSON.stringify(this.event))
      delete event._tile
      delete event.creator
      delete event.residence
      delete event.start_date
      delete event.start_time
      delete event.end_date
      delete event.end_time
      console.log(this.event)
      this.api.post('events', event)
        .then((response) => {
          console.log(response.data)
          this.dialog = false;
        })
        .catch(console.error)
    },
    saveEvent: function () {
      this.event.start = moment.utc(this.event.start_date + " " + this.event.start_time, "YYYY-MM-DD HH:mma")
      this.event.end = moment.utc(this.event.end_date + " " + this.event.end_time, "YYYY-MM-DD HH:mma")
      this.event.creator_id = this.api.user.id
      this.event.residence_id = this.api.user.residence_id
      var event = JSON.parse(JSON.stringify(this.event))
      delete event._tile
      delete event.creator
      delete event.residence
      delete event.start_date
      delete event.start_time
      delete event.end_date
      delete event.end_time

      console.log(this.event)
      this.api.put('events/' + event.id, event)
        .then((response) => {
          this.api.events.filter((ev) => {
            ev.id === response.id
          })
          console.log(response.data)
        })
        .catch(console.error)
      this.dialog = false;
    },
    deleteEvent(event) {
      this.api.delete('events/' + event.id)
        .then((response) => {
          this.dialog = false;
        })
        .catch(console.error)
    },
    refreshEvents: function () {
      setTimeout(() => {
        if (this.$refs.calendar)
          this.$refs.calendar.$emit('reload-events')
      }, 100)
    },
    dayClick: function (day) {
      this.createEvent(day)
    },
    canSave: function () {
      return this.event.title && this.event.title.length > 3 &&
        this.event.start_date && this.event.start_time
    },
    duration: function (start, end) {
      return moment.duration(moment(start).diff(moment(end))).humanize()
    }
  },
  computed: {
    nextEvents: function (max = 6) {
      var events = []
      var now = moment()
      for (var i = 0; i < this.api.events.length; i++) {
        var event = this.api.events[i];
        if (now > moment(event.end)) {
          continue
        }
        events[events.length] = event
      }
      return events;
    }
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

.fc-toolbar button:focus,
.fc-toolbar .fc-state-active,
.fc-toolbar .ui-state-active {
  z-index: 0
}


.fc-unthemed td.fc-today {
  background-color: rgba(255, 255, 0, .4)
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
