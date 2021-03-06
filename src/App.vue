<template>
  <v-app id="example-2" :dark="false">
    <v-navigation-drawer app temporary v-model="drawer" overflow>
      <v-list class="pa-0" v-if="api.user.id">
        <v-list-tile avatar tag="div" class="primary" @click="see_residences = !see_residences">
          <v-list-tile-avatar>
            <img :src="api.user.image_url" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-if="api.user" class="white--text">{{ api.user.name }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon dark>{{!see_residences? 'keyboard_arrow_left': 'keyboard_arrow_down'}}</v-icon>
          </v-list-tile-action>
        </v-list-tile>

        <template v-if="see_residences && api.user.residences">
          <v-subheader class="grey text-capitalize white--text">{{api.trans('literals.my')}} {{api.trans('literals.residences')}}</v-subheader>
          <v-list-tile @click="changeResidence(res)" v-for="res in api.user.residences" :key="res.id" :disabled="res.id === api.residence.id">
            <v-list-tile-avatar>
              <v-icon :class=" (res.status == 'solvent'?'green':'red') + '--text'">home</v-icon>
            </v-list-tile-avatar>
            {{res.name}}
          </v-list-tile>
        </template>
        <v-btn @click="panic()" fab small absolute bottom right style="bottom:25px;" color="danger">
          <v-tooltip left>
            <span>{{api.trans('__.panic button')}}</span>
            <v-icon slot="activator" class="white--text">fa-life-ring</v-icon>
          </v-tooltip>
        </v-btn>
      </v-list>
      <v-list class="pt-0" dense v-if="!(see_residences && api.user.residences)">
        <v-divider></v-divider>
        <v-list-tile :to="page.url" v-for="(page,i) in pages" :key="i" v-if="siteHas(page.module)">
          <v-list-tile-action>
            <v-icon>{{ page.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="text-capitalize">{{ api.trans('literals.'+page.title) }}</v-list-tile-title>
          </v-list-tile-content>
          <v-tooltip left>
            <v-list-tile-action v-if="page.title==='visitas'" slot="activator">
              <v-chip class="accent white--text green--after">
                {{waitingConfirmation()}}
              </v-chip>
            </v-list-tile-action>
            <span>{{api.trans('literals.waiting for confirmation')}}</span>
          </v-tooltip>
        </v-list-tile>

        <v-list-tile to="chats" v-if="api.user && siteHas('chat')">
          <v-list-tile-action>
            <v-icon>chat</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="text-capitalize">{{ api.trans('literals.chats') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click.native="logout()">
          <v-list-tile-action>
            <v-icon>fa-sign-out</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Cerrar Sesión</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>
    <v-toolbar app prominent fixed class="primary" v-if="api.user.id" dark>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-spacer>
        <div class="text-xs-center">
          <v-toolbar-title>
            <img v-if="api.user" src="./assets/logo.png" class="hidden-md-and-up logo" @click="navigate('/')">
            <img v-else :src="api.url +'/img/icon.png'" class="hidden-md-and-up logo" @click="navigate('/')">
            <img v-if="api.user" src="./assets/logo-completo.png" class="hidden-sm-and-down logo" @click="navigate('/')">
            <img v-else :src="api.url +'/img/logo.png'" class="hidden-sm-and-down logo" @click="navigate('/')">
          </v-toolbar-title>
        </div>
      </v-spacer>

      <v-toolbar-items>
        <v-menu bottom left :position-absolutely="true">
          <v-btn flat slot="activator" style="height:100%; padding:8px 0px;">
            <img class="hidden-sm-and-down avatar small" :src="api.user.image_url">
            <span class="hidden-sm-and-down">
              {{api.user.name}}
            </span>
            <v-icon class="hidden-sm-and-down white--text">arrow_drop_down</v-icon>
            <v-icon class="hidden-md-and-up white--text" style="margin: 8px 0px; ">more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile avatar :href="api.url + '../admin'" v-if="api.user.admin===1">
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
                <v-icon> fa-sign-out</v-icon>
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
      <v-content>
          <transition name="fade" :duration="{ enter: 120, leave: 120 }" mode="out-in">
            <router-view></router-view>
          </transition>
      </v-content>
    </main>

    <v-snackbar :timeout="timeout" success top right v-model="visitConfirmToast">
      <span v-if="visitor">
        {{api.trans('__.visit confirmed',{visit:api.trans('literals.visit') ,visitor:visitor.name})}}
      </span>

      <v-btn icon flat class="white--text" @click.native="visitConfirmToast = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-snackbar warning multi-line :timeout="3000" top right v-model="newChat">
      <p>
        <v-avatar size="28px">
          <img :src="sender.image_url">
        </v-avatar>

        <b v-if="sender">
          {{sender.name}}
          <span v-if="sender.residence"> - {{ sender.residence.name }}</span> :
        </b>
        <span>
          {{message}}
        </span>
      </p>
      <v-btn icon small flat class="white--text" @click.native="newChat = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-snackbar error multi-line :timeout="3000" bottom center v-model="panicSent">
      <span>
        {{api.trans('__.panic sent')}}
      </span>
      <v-btn icon small flat class="white--text" @click.native="panicSent = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-dialog persistent v-model="newVisitModal" width="400px">
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>{{api.trans('__.you have a new visit')}}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <p>
            <b>{{api.trans('literals.visitor')}} </b>
            <span v-if="visitor">{{visitor.name}}</span>
          </p>
          <p>
            <b>{{api.trans('literals.status')}}</b>
            <span v-if="visit">{{api.trans('literals.'+visit.status)}}</span>
          </p>
          <p v-if="visit && visit.note">
            <b>{{api.trans('literals.note')}}</b>
            <span> {{visit.note}}</span>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="visitConfirmed('approved')">
            {{api.trans('literals.confirm')}}
          </v-btn>
          <v-btn dark color="danger" @click="visitConfirmed('rejected')">
            {{api.trans('literals.reject')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import Echo from "laravel-echo";
window.Pusher = require("pusher-js");
window.io = require("socket.io-client");
var api = require("./services/api.js");
window.$api = api;
export default {
  mounted() {
    this.api.ready
      .then(data => {
        this.getData();
        this.startEcho();
      })
      .catch(err => {
        console.error(err);
        this.navigate("/login");
      });
    this.$router.app.$on("login", data => {
      this.getData();
      this.startEcho();
      setTimeout(this.getVisits, 3000);
    });
    this.$router.app.$on("logout", data => {
      this.api.user = {};
      window.storage.clear();
      this.$router.push("/login");
      this.stopEcho();
    });
  },
  data() {
    return {
      api: api,
      drawer: false,
      pages: [
        { icon: "home", title: "home", url: "/" },
        {
          icon: "account_balance_wallet",
          title: "invoices",
          url: "invoices",
          siteHas: "finanze"
        },
        { icon: "person", title: "profile", url: "profile" },
        { icon: "list", title: "mis listas", url: "tables" },
        { icon: "people", title: "visitas", url: "visits", siteHas: "visits" },
        {
          icon: "markunread_mailbox",
          title: "correspondencias",
          url: "correspondences",
          siteHas: "correspondences"
        },
        {
          icon: "fa-sitemap",
          title: "directives",
          url: "directives",
          siteHas: "directives"
        },
        {
          icon: "fa-ticket",
          title: "tickets",
          url: "tickets",
          siteHas: "tickets"
        },
        { icon: "event", title: "events", url: "events", siteHas: "events" },
        {
          icon: "insert_drive_file",
          title: "documentos",
          url: "documents",
          siteHas: "documents"
        },
        {
          icon: "event_available",
          title: "Reservaciones",
          url: "reservations",
          siteHas: "reservations"
        },
        {
          icon: "pie_chart",
          title: "surveys",
          url: "surveys",
          siteHas: "surveys"
        }
      ],
      timeout: 15 * 60 * 1000,
      visitConfirmToast: false,
      newVisitModal: false,
      see_residences: false,
      visitor: null,
      visit: null,
      audio: null,
      panicSent: false,
      newChat: false,
      message: "",
      sender: {}
    };
  },
  methods: {
    getData() {
      this.api
        .get("getData")
        .then(response => {
          console.log(response.data);
          this.api.setUser(response.data);
          window.storage.setItem("user", JSON.stringify(response.data.user));
          window.storage.setItem(
            "residence",
            JSON.stringify(response.data.residence)
          );
          window.storage.setItem(
            "settings",
            JSON.stringify(response.data.settings)
          );
          window.storage.setItem(
            "modules",
            JSON.stringify(response.data.modules)
          );

          this.api
            .get("lang")
            .then(response => {
              console.log(response.data);
              this.api.i18n = response.data;
              window.storage.setItem("i18n", JSON.stringify(response.data));
            })
            .catch(console.error);
        })
        .catch(console.error);
    },
    changeResidence(residence) {
      api.user.residence_id = residence.id;
      window.storage.setItem("user", JSON.stringify(this.api.user));
      this.api
        .put("users/" + this.api.user.id, { residence_id: residence.id })
        .then(response => {
          window.location.reload();
        })
        .catch(console.error);
    },
    newVisit(data) {
      this.visitor = data.visitor;
      this.visitConfirmToast = true;
      this.audio = new Audio("./static/sounds/beep.mp3");
      this.audio.play();
    },
    getVisits() {
      this.api
        .get(
          "visits?with[]=visitor&with[]=visitors&where[residence_id]=" +
            api.user.residence_id +
            "limit=500&order[created_at]=desc"
        )
        .then(resp => {
          this.api.visits = resp.data;
        })
        .catch(console.error);
    },
    waitingConfirmation() {
      var count = 0;
      this.api.visits.forEach(visit => {
        if (visit.status === "waiting for confirmation") count++;
      });
      return count;
    },
    visitConfirm(data) {
      this.visitor = data.visitor;
      this.visit = data.visit;
      this.newVisitModal = true;
      this.audio = new Audio("./static/sounds/notifications.mp3");
      this.audio.play();
    },
    visitConfirmed(response) {
      if (this.audio) this.audio.pause();
      this.api
        .post(`visits/${this.visit.id}/visitApprove`, { status: response })
        .then(resp => {
          console.log(resp);
        })
        .catch(console.error);
      this.newVisitModal = false;
    },
    newChatMessage(thread, message, sender) {
      if (api.user.id !== sender.id) {
        this.sender = sender;
        this.message = message.body;
        this.newChat = true;
      }
      this.audio = new Audio("./static/sounds/chat.mp3");
      this.audio.play();
    },
    startEcho() {
      if (this.api.Echo) {
        console.warn("already started Echo");
        this.stopEcho();
      }
      this.api.Echo = new Echo({
        key: "807bbfb3ca20f7bb886e",
        authEndpoint: this.api.url + "broadcasting/auth",
        broadcaster: "socket.io", // pusher o socket.io
        host: this.api.user.hostEcho,
        auth: {
          headers: {
            "Auth-Token": this.api.user.token
          }
        }
      });
      window.Echo = this.api.Echo;
      window.socket = this.api.Echo.connector.socket;

      this.api.Echo
        .private("Application")
        .listen("ParkingCreated", data => {
          console.log("created parking:", data);
          data.parking.user = data.user;
          data.parking.residence = data.residence;
          this.api.parkings[this.api.parkings.length] = data.parking;
        })
        .listen("ParkingUpdated", data => {
          console.log("updated parking:", data);
          var parking = this.api.parkings.findIndex(parking => {
            return parking.id === data.parking.id;
          });
          data.parking.user = data.user;
          data.parking.residence = data.residence;
          if (parking >= 0) {
            this.api.parkings[parking] = data.parking;
          } else {
            this.api.parkings[this.api.parkings.length] = data.parking;
          }
        })
        .listen("ParkingDeleted", data => {
          console.log("deleted parking:", data);
          var parking = this.api.parkings.findIndex(parking => {
            return parking.id === data.parking.id;
          });
          if (parking >= 0) {
            this.api.parkings.splice(parking, 1);
          }
        })
        .listen("SurveyCreated", data => {
          console.log("survey created:", data);
          this.$router.app.$emit("surveyUpdated", data.survey);
        })
        .listen("SurveyUpdated", data => {
          console.log("survey udpated:", data);
          this.$router.app.$emit("surveyUpdated", data.survey);
        })
        .listen("SurveyDeleted", data => {
          console.log("survey deleted:", data);
          this.$router.app.$emit("surveyUpdated", data.survey);
        })
        .listen("VisitorCreated", data => {
          console.log("created visitor:", data);
          if (data.visitor.residence_id != api.user.residence_id) return;
          var visitor = (this.api.residence.visitors[
            this.api.residence.visitors.length
          ] =
            data.visitor);
          if (data.image) visitor.image = data.image;
        })
        .listen("VisitorUpdated", data => {
          console.log("updated visitor:", data);
          if (data.visitor.residence_id !== api.user.residence_id) return;
          var visitor_index = this.api.residence.visitors.findIndex(visitor => {
            return visitor.id === data.visitor.id;
          });
          if (visitor_index > -1)
            var visitor = (this.api.residence.visitors[visitor_index] =
              data.visitor);
          else {
            var visitor = (this.api.residence.visitors[
              this.api.residence.visitors.length
            ] =
              data.visitor);
          }
          if (data.image) {
            visitor.image = data.image;
          }
        })
        .listen("VisitorDeleted", data => {
          console.log("deleted visitor:", data);
          var visitor = this.api.residence.visitors.findIndex(visitor => {
            return visitor.id === data.visitor.id;
          });
          if (visitor > -1) {
            this.api.residence.visitors.splice(visitor, 1);
          }
        })
        .listen("VehicleCreated", data => {
          console.log("created vehicle:", data);
          if (data.vehicle.residence_id != api.user.residence_id) return;
          var vehicle = (this.api.residence.vehicles[
            this.api.residence.vehicles.length
          ] =
            data.vehicle);
          if (data.image) vehicle.image = data.image;
        })
        .listen("VehicleUpdated", data => {
          console.log("updated vehicle:", data);
          if (data.vehicle.residence_id !== api.user.residence_id) return;
          var vehicle_index = this.api.residence.vehicles.findIndex(vehicle => {
            return vehicle.id === data.vehicle.id;
          });
          if (vehicle_index > -1)
            var vehicle = (this.api.residence.vehicles[vehicle_index] =
              data.vehicle);
          else {
            var vehicle = (this.api.residence.vehicles[
              this.api.residence.vehicles.length
            ] =
              data.vehicle);
          }
          if (data.image) {
            vehicle.image = data.image;
          }
        })
        .listen("VehicleDeleted", data => {
          console.log("deleted vehicle:", data);
          var vehicle = this.api.residence.vehicles.findIndex(vehicle => {
            return vehicle.id === data.vehicle.id;
          });
          if (vehicle > -1) {
            this.api.residence.vehicles.splice(vehicle, 1);
          }
        })
        .listen("WorkerCreated", data => {
          console.log("created worker:", data);
          if (data.worker.residence_id != api.user.residence_id) return;
          var worker = (this.api.residence.workers[
            this.api.residence.workers.length
          ] =
            data.worker);
          if (data.image) worker.image = data.image;
        })
        .listen("WorkerUpdated", data => {
          console.log("updated worker:", data);
          if (data.worker.residence_id !== api.user.residence_id) return;
          var worker_index = this.api.residence.workers.findIndex(worker => {
            return worker.id === data.worker.id;
          });
          if (worker_index > -1)
            var worker = (this.api.residence.workers[worker_index] =
              data.worker);
          else {
            var worker = (this.api.residence.workers[
              this.api.residence.workers.length
            ] =
              data.worker);
          }
          if (data.image) {
            worker.image = data.image;
          }
        })
        .listen("WorkerDeleted", data => {
          console.log("deleted worker:", data);
          var worker = this.api.residence.workers.findIndex(worker => {
            return worker.id === data.worker.id;
          });
          if (worker > -1) {
            this.api.residence.workers.splice(worker, 1);
          }
        })
        .listen("PetCreated", data => {
          console.log("created pet:", data);
          if (data.pet.residence_id != api.user.residence_id) return;
          var pet = (this.api.residence.pets[this.api.residence.pets.length] =
            data.pet);
          if (data.image) pet.image = data.image;
        })
        .listen("PetUpdated", data => {
          console.log("updated pet:", data);
          if (data.pet.residence_id !== api.user.residence_id) return;
          var pet_index = this.api.residence.pets.findIndex(pet => {
            return pet.id === data.pet.id;
          });
          if (pet_index > -1)
            var pet = (this.api.residence.pets[pet_index] = data.pet);
          else {
            var pet = (this.api.residence.pets[this.api.residence.pets.length] =
              data.pet);
          }
          if (data.image) {
            pet.image = data.image;
          }
        })
        .listen("PetDeleted", data => {
          console.log("deleted pet:", data);
          var pet = this.api.residence.pets.findIndex(pet => {
            return pet.id === data.pet.id;
          });
          if (pet > -1) {
            this.api.residence.pets.splice(pet, 1);
          }
        })
        .listen("VisitCreated", data => {
          console.log("created visit:", data);
          if (data.visit.residence_id != api.user.residence_id) return;
          var visit_index = this.api.visits.findIndex(ev => {
            return ev.id === data.visit.id;
          });
          data.visit.visitor = data.visitor;
          data.visit.visitors = data.visitors;
          if (visit_index > -1) {
            if (
              this.api.visits[visit_index].status !== "approved" &&
              data.visit.status === "approved"
            )
              this.newVisit(data);
            this.api.visits = [data.visit].concat(this.api.visits);
          } else {
            if (data.visit.status === "approved") this.newVisit(data);
            this.api.visits[this.api.visits.length] = data.visit;
          }
          this.$router.app.$emit("visitCreated", data.visit);
          if (data.visit.status === "approved") this.newVisit(data);
        })
        .listen("VisitUpdated", data => {
          console.log("updated visit:", data);
          if (data.visit.residence_id != api.user.residence_id) return;
          var visit_index = this.api.visits.findIndex(ev => {
            return ev.id === data.visit.id;
          });
          data.visit.visitor = data.visitor;
          data.visit.visitors = data.visitors;
          if (visit_index > -1) {
            if (
              this.api.visits[visit_index].status !== "approved" &&
              data.visit.status === "approved"
            )
              this.newVisit(data);
            var visit = (this.api.visits[visit_index] = data.visit);
          }
          this.$router.app.$emit("visitUpdated", data.visit);
        })
        .listen("VisitDeleted", data => {
          console.log("deleted visit:", data);
          var visit_index = this.api.visits.findIndex(ev => {
            return ev.id === data.visit.id;
          });
          if (visit_index >= -1) {
            this.api.visits.splice(visit_index, 1);
            this.$router.app.$emit("visitDeleted", data.visit);
          }
        })
        .listen("EventCreated", data => {
          if (
            !(
              data.event.privacity == "public" ||
              data.residence.id == api.user.residence_id
            )
          )
            return;
          console.log("created event:", data);
          this.api.events[this.api.events.length] = data.event;

          if (data.event.privacity == "private") {
            data.event.borderColor = "red";
          } else {
            data.event.borderColor = "lime";
          }
          data.event.className = data.event.type;
          this.$router.app.$emit("eventCreated", data.event);
        })
        .listen("EventUpdated", data => {
          console.log("updated event:", data);
          if (
            !(
              data.event.privacity == "public" ||
              data.residence.id == api.user.residence_id
            )
          )
            return;
          var event_index = this.api.events.findIndex(ev => {
            return ev.id === data.event.id;
          });
          if (event_index > -1) this.api.events[event_index] = data.event;
          else this.api.events[this.api.events.length] = data.event;

          if (data.event.privacity == "private") {
            data.event.borderColor = "red";
          } else {
            data.event.borderColor = "lime";
          }
          data.event.className = data.event.type;

          this.$router.app.$emit("eventChanged", data.event);
        })
        .listen("EventDeleted", data => {
          console.log("deleted event:", data);
          var event_index = this.api.events.findIndex(ev => {
            return ev.id === data.event.id;
          });
          if (event_index >= -1) {
            this.api.events.splice(event_index, 1);
            this.$router.app.$emit("eventDeleted", data.event);
          }
        });

      this.api.Echo
        .private("App.Residence." + api.user.residence_id)
        .listen("VisitConfirm", data => {
          console.log("VisitConfirm: ", data);
          data.visit.visitor = data.visitor;
          data.visit.visitors = data.visitors;
          this.visitConfirm(data);
          this.$router.app.$emit("VisitConfirm", data);
        });

      this.api.Echo
        .private("App.User." + this.api.user.id)
        .listen("Chat", data => {
          console.log("new chat event", data);
          var thread = data.thread;
          var message = data.message;
          var sender = data.sender;
          var residence = data.residence;
          this.newChatMessage(thread, message, sender);
          this.$router.app.$emit("Chat", {
            thread: thread,
            message: message,
            sender: sender,
            residence: residence
          });
        })
        .notification(notification => {
          console.log(notification);
        });

      this.api.Echo
        .join("App.Mobile")
        .here(data => {
          console.log("here:", data);
        })
        .joining(data => {
          console.log("joining", data);
        })
        .leaving(data => {
          console.log("leaving", data);
        });
    },
    stopEcho() {
      this.api.Echo.leave("Application");
      this.api.Echo.leave("App.User." + this.api.user.id);
      this.api.Echo.leave("App.Residence." + api.user.residence_id);
      this.api.Echo.leave("App.Mobile");
      this.api.Echo = undefined;
    },
    navigate(uri) {
      this.$router.push(uri);
    },
    logout() {
      this.api.user = {};
      window.storage.clear();
      this.$router.push("/login");
    },
    panic() {
      this.api
        .post("panic", {})
        .then(resp => {
          console.log(resp.data);
          this.panicSent = true;
          this.panicWithLocation(resp.data);
        })
        .catch(console.error);
    },
    panicWithLocation(panic) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resp => {
          console.log(resp);
          var locs = {
            accuracy: resp.coords.accuracy,
            altitude: resp.coords.altitude,
            latitude: resp.coords.latitude,
            longitude: resp.coords.longitude,
            speed: resp.coords.speed,
            heading: resp.coords.heading,
            altitudeAccuracy: resp.coords.altitudeAccuracy,
            timestamp: resp.timestamp
          };
          this.api
            .put("panics/" + panic.id, { location: locs })
            .then(dataL => {
              console.log("panic with locs", dataL);
            })
            .catch(err => {
              console.error("error sending panic with location", err);
            });
        }, console.error);
      }
    },
    siteHas(modul) {
      if (this.api.modules === undefined) return false;
      if (modul === undefined || this.api.modules[modul] === undefined)
        return true;
      return this.api.modules[modul];
    }
  }
};
</script>

<style lang="stylus">
@import './stylus/main';

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.avatar {
  border-radius: 50px;
  margin: 0 6px;

  &.small {
    width: 40px;
    height: 40px;
  }

  &.medium {
    width: 70px;
    height: 70px;
  }
}

.text-capitalize {
  text-transform: capitalize;
}

.logo {
  height: 55px;
  margin-top: 5px;
  cursor: pointer;
  transition: all 0.4s;

  &:hover {
    height: 70px;
  }
}

.router-link-exact-active {
  background: rgba(127, 127, 127, 0.4);
}
</style>
