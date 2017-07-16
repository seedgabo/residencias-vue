<template>
  <v-container fluid>

    <v-layout wrap>
      <!--//* CARD PROFILE  -->
      <v-flex xs12 sm6 md4>
        <v-card>
          <v-card-media src=" https://ak2.picdn.net/shutterstock/videos/23151772/thumb/1.jpg " height="150px" class="white--text">
            <v-container fill-height fluid>
              <v-layout fill-height wrap>
                <v-flex xs12 align-center flexbox>
                  <img :src="api.user.image_url" class="avatar medium">
                </v-flex>
                <v-flex xs12 align-end flexbox>
                  <span class="headline">{{api.user.name}}</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-media>
          <v-card-text style="height: 1px; position: relative">
            <v-btn absolute small dark fab top right class="pink" @click.native="updateUser()">
              <v-icon>save</v-icon>
            </v-btn>
            <v-subheader class="grey--text text--lighten-1">Profile</v-subheader>
          </v-card-text>
          <v-card-title>
            <v-layout row wrap>
              <v-flex xs12 style="width:100%">
                <v-text-field prepend-icon="account_circle" type="text" v-model="api.user.name" label="Name" :rules="[rules.required]"></v-text-field>
              </v-flex>
              <v-flex xs12 style="width:100%">
                <v-text-field prepend-icon="email" type="email" v-model="api.user.email" label="Email" :rules="[rules.required,rules.email]"></v-text-field>
              </v-flex>
              <v-flex xs12 style="width:100%">
                <v-text-field prepend-icon="card_membership" type="number" v-model="api.user.document" label="Document" :rules="[rules.document]" min="1000" max="1000000000"></v-text-field>
              </v-flex>
              <v-flex xs12 style="width:100%">
                <v-text-field prepend-icon="phone" type="number" v-model="api.user.phone_number" label="Phone"></v-text-field>
              </v-flex>
              <v-flex xs12 style="width:100%">
                <v-select prepend-icon="wc" v-model="api.user.sex" v-bind:items="genders" label="Sex"></v-select>
              </v-flex>
              <v-flex xs12 style="width:100%">
                <v-menu lazy :close-on-content-click="true" transition="scale-transition" offset-y full-width :nudge-left="40" max-width="290px">
                  <v-text-field slot="activator" label="Picker in menu" v-model="api.user.birthday" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="api.user.birthday" scrollable actions>
                    <template scope="{ save, cancel }">
                      <v-card-actions>
                        <v-btn flat primary @click.native="cancel()">Cancel</v-btn>
                        <v-btn flat primary @click.native="save()">Save</v-btn>
                      </v-card-actions>
                    </template>
                  </v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 class="text-xs-right">
                <v-btn flat primary @click.native="updateUser()">
                  Save &nbsp;
                  <v-icon primary>save</v-icon>
                </v-btn>
              </v-flex>

            </v-layout>
          </v-card-title>
        </v-card>
      </v-flex>
      <!--//* END CARD PROFILE  -->

      <!--//* CARD RESIDENCE  -->
      <v-flex xs12 sm6 md4>
        <v-card>
          <v-toolbar class="text-xs-center primary white--text">
            <v-icon dark>home</v-icon>
            <v-subheader>{{api.residence.name}}
            </v-subheader>
            <v-spacer></v-spacer>
            <v-btn icon dark @click.native="editable=!editable">
              <v-icon>{{ editable ? 'close' : 'edit'}}</v-icon>
            </v-btn>
          </v-toolbar>

          <transition name="fadeLeft" enter-active-class="animated zoomIn" leave-active-class="animated zoomOut" mode="out-in" :duration="{ enter: 200, leave:200 }">

            <v-card-text v-if="!editable" key="normal">
              <v-layout>
                <v-flex>
                  <b>{{api.trans('literals.status')}}</b>
                </v-flex>
                <v-flex class="text-xs-right" v-bind:class="{ 'success--text': api.residence.status == 'solvent', 'danger--text': api.residence.status != 'solvent'}">
                  <span> {{api.trans('literals.'+ api.residence.status)}}</span>
                </v-flex>
              </v-layout>
              <br>
              <v-layout>
                <v-flex class="text-xs-center">
                  <div id="gauge"></div>
                </v-flex>
              </v-layout>

              <v-layout v-if="api.residence.owner">
                <v-flex>
                  <b>{{api.trans('literals.owner')}}</b>
                </v-flex>
                <v-flex class="text-xs-right">
                  <span>{{api.residence.owner.name}}</span>
                </v-flex>
              </v-layout>

              <br>
              <v-layout>
                <v-flex>
                  <b>{{api.trans('literals.number_of_people')}}</b>
                </v-flex>
                <v-flex class="text-xs-right">
                  <span>{{api.residence.number_of_people}}</span>
                </v-flex>
              </v-layout>

              <br>
              <v-layout>
                <v-flex>
                  <b>{{api.trans('literals.alicuota')}}</b>
                </v-flex>
                <v-flex class="text-xs-right">
                  <span>{{api.residence.alicuota}}%</span>
                </v-flex>
              </v-layout>

              <br>
              <v-layout>
                <v-flex>
                  <b>{{api.trans('literals.users')}}</b>
                </v-flex>
                <v-flex class="text-xs-right">
                  <p v-for="user in api.residence.users" :key="user.id">{{user.name}}</p>
                </v-flex>
              </v-layout>
            </v-card-text>

            <v-card-text v-else key="edit">
              <v-text-field :label="api.trans('literals.name')" v-model="api.residence.name" prepend-icon="home"></v-text-field>
              <v-text-field :label="api.trans('literals.number_of_people')" v-model="api.residence.number_of_people" prepend-icon="people"></v-text-field>
              <v-select v-bind:items="api.residence.users" :label="api.trans('literals.owner')" prepend-icon="person" v-model="api.residence.owner_id" item-text="name" item-value="id">
                <template slot="selection" scope="data">
                  <v-avatar style="display:inline">
                    <img :src="data.item.image_url">
                  </v-avatar>
                  <span>
                    {{ data.item.name }}
                  </span>
                </template>
                <template slot="item" scope="data">
                  <v-list-tile-avatar>
                    <img v-bind:src="data.item.image_url" />
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
              <v-flex class="text-xs-right">
                <v-btn primary flat @click.native="updateResidence()">
                  <v-icon class="primary--text">save</v-icon>
                  &nbsp;
                  <span>{{api.trans('crud.save')}}</span>
                </v-btn>
              </v-flex>
            </v-card-text>

          </transition>

          <v-card-actions v-if="!editable">
            <v-btn flat class="primary--text" @click.native="editable=!editable">
              <v-icon primary>edit</v-icon>
              {{api.trans('crud.edit')}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn flat class="grey--text" to="invoices">
              <v-icon class="grey--text">account_balance_wallet</v-icon>
              {{this.api.trans('literals.invoices')}}
            </v-btn>
            <v-btn flat class="grey--text" to="documents">
              <v-icon class="grey--text">insert_drive_file</v-icon>
              {{this.api.trans('literals.dynamic_documents')}}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-flex>
      <!--//* END CARD RESIDENCE  -->

      <!--//* CARD USERS  -->
      <v-flex xs12 sm6 md4>
        <v-card>
          <v-toolbar class="primary white--text" extended>
            <v-icon dark>people</v-icon>
            <v-subheader>{{api.trans('literals.users')}}</v-subheader>

            <v-toolbar-title slot="extension" class="white--text">
              <v-text-field v-model="query_users" prepend-icon="search" dark class="white--text always-blank" label="Search"></v-text-field>
            </v-toolbar-title>
            <v-btn fab small class="cyan accent-2" bottom left absolute>
              <v-icon>add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-list>
              <v-list-tile avatar v-for="user in filterBy(api.residence.users, query_users)" :key="user.id">
                <v-list-tile-avatar>
                  <img :src="user.image_url" alt="">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{user.name}}</v-list-tile-title>
                  <small>{{user.email}}</small>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-flex>
      <!--//* END CARD USERS  -->

      <v-snackbar :timeout="6000" success top right v-model="snackbar_success">
        {{api.trans('literals.user')}} {{api.trans('crud.updated')}}
        <v-btn dark icon @click.native="snackbar_success = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>

      <v-snackbar :timeout="6000" success top right v-model="snackbar_success_residence">
        {{api.trans('literals.residence')}} {{api.trans('crud.updated')}}
        <v-btn dark icon @click.native="snackbar_success = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>

    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Profile',
  mounted() {
    this.api.ready
      .then((dat) => {
        this.drawGage()
      })
  },
  data() {
    return {
      api: require('../services/api.js'),
      genders: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
      ],
      rules: {
        required: (value) => !!value || 'Required.',
        email: (value) => {
          const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
        document: (value) => {
          return (value > 10000 && value < 10000000000) || 'Not a valid document number'
        },
      },
      query_users: '',
      editable: false,
      snackbar_success: false,
      snackbar_success_residence: false,
    }
  },
  methods: {
    drawGage: function () {

      var g = new JustGage({
        id: "gauge",
        value: this.api.residence.debt,
        min: 0,
        donut: true,
        symbol: '$',
        counter: true,
        percents: true,
        max: this.api.residence.total,
        title: "total debt"
      });
    },
    updateUser: function () {
      this.api.put('users/' + this.api.user.id,
        {
          name: this.api.user.name,
          email: this.api.user.email,
          document: this.api.user.document,
          sex: this.api.user.sex,
          phone_number: this.api.user.phone_number,
          birthday: this.api.user.birthday
        })
        .then((response) => {
          console.log(response.data)
          this.snackbar_success = true;
          window.localStorage.setItem('user', JSON.stringify(this.api.user));
        })
        .catch(console.error);
    },
    updateResidence: function () {
      this.api.put('residences/' + this.api.user.residence_id,
        {
          name: this.api.residence.name,
          number_of_people: this.api.residence.number_of_people,
          owner_id: this.api.residence.owner_id,
        })
        .then((response) => {
          this.snackbar_success_residence = true;
          var owner = this.api.residence.users.find((user) => {
            return user.id == this.api.residence.owner_id
          });
          this.api.residence.owner = owner;
          window.localStorage.setItem('residence', JSON.stringify(this.api.residence));
          this.editable = false;
          setTimeout(() => { this.drawGage() }, 500)
        })
        .catch(console.error);
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
  .always-blank
    color white !important
</style>

