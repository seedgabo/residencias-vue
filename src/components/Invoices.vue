<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12 center>
        <h2 class="headline text-xs-center" primary>
          <v-icon fa>files-o</v-icon>
          &nbsp; {{api.trans('literals.invoices')}}
        </h2>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-layout wrap align-center>
              <v-flex xs12 class="text-xs-center">
                <span>
                  {{api.trans('literals.percent')}}:
                </span>
              </v-flex>
              <v-flex xs12 class="text-xs-center">
                <v-progress-circular v-bind:size="70" v-bind:width="10" v-bind:rotate="-90" v-bind:value=" total>0 ? debt/total*100: 0" class="teal--text">
                  {{(debt/total*100).toFixed(2)}}%
                </v-progress-circular>
              </v-flex>
            </v-layout>
            <v-spacer></v-spacer>
            <b> {{api.trans('literals.total')}} {{api.trans('literals.debt')}} : </b>
            &nbsp;
            <span> {{debt | currency }} </span>
          </v-card-title>
          <v-data-table :loading="!loading" :pagination.sync="pagination" :headers="headers" :items="invoices" class="elevation-1 text-xs-right">
            <template slot="items" scope="props">
              <td>
                <a href="#/invoicesev">
                  {{props.item.number}}
                </a>
              </td>
              <td>{{api.trans('__.'+props.item.type)}}</td>
              <td v-if="props.item.type != 'residential'">{{ props.item.date | moment("dddd, MMMM D YYYY")}}</td>
              <td class="text-capitalize" v-else>{{ props.item.date | moment('MMMM/YYYY') }} </td>
              <td>{{ props.item.total | currency }}</td>
              <td :class="(props.item.status=='paid'?'green':'red') + '--text'">
                <strong>{{ api.trans('literals.'+props.item.status)}}</strong>
              </td>
              <td>
                <v-btn v-if="props.item.status !== 'paid'" v-tooltip:bottom="{ html: api.trans('__.report payment')}" icon>
                  <v-icon class="primary--text">credit_card</v-icon>
                </v-btn>
                <v-btn v-if="props.item.receipts.length!==0 " v-tooltip:bottom="{ html: (api.trans('literals.download') +  ' ' + api.trans('literals.receipt')) }" icon :href="api.url + 'receipt/'+ props.item.receipts[0].id +'/pdf?token='+ api.user.token" target="receipt">
                  <v-icon class="green--text" fa>file-text-o</v-icon>
                </v-btn>
                <v-btn v-tooltip:bottom="{ html: api.trans('literals.download') }" icon :href="api.url + 'invoice/'+ props.item.id +'/pdf?token='+ api.user.token" target="invoice">
                  <v-icon class="red--text" fa>file-pdf-o</v-icon>
                </v-btn>
                <v-btn icon v-tooltip:bottom="{ html: api.trans('__.send email') }" small @click.native="sendMailInvoice(props.item)">
                  <v-icon class="">email</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>

        </v-card>
      </v-flex>
    </v-layout>

    <v-snackbar :timeout="4000" top right v-model="success_email">
      {{api.trans('literals.email') + " " + api.trans('literals.sent')}}
    </v-snackbar>
  </v-container>
</template>

<script>
var api = require('../services/api.js')
const moment = require('moment')
export default {
  name: 'invoices',
  mounted() {
    this.api.ready
      .then(() => {
        this.getInvoices();
      });
  },
  data() {
    return {
      invoices: [],
      loading: false,
      pagination: { sortBy: 'date', page: 1, rowsPerPage: 50, descending: true },
      headers: [
        { text: api.trans('literals.#'), value: 'number' },
        { text: api.trans('literals.type'), value: 'type' },
        { text: api.trans('literals.date'), value: 'date' },
        { text: api.trans('literals.total'), value: 'total' },
        { text: api.trans('literals.status'), value: 'status' },
        { text: api.trans('crud.actions'), value: 'actions' },
      ],
      api: api,
      success_email: false,
    }
  },
  methods: {
    getInvoices() {
      this.loading = false
      this.api.get('invoices?with[]=receipts&with[]=items&where[residence_id]=' + this.api.user.residence_id)
        .then((response) => {
          this.loading = true
          console.log(response.data)
          this.invoices = response.data
        })
        .catch(console.error)
    },
    sendMailInvoice: function (invoice) {
      if (confirm(this.api.trans('__.are you sure?')))
        this.api.post(`invoice/${invoice.id}/email`)
          .then((data) => {
            this.success_email = true
          })
          .catch(console.error);
    },
    sendMailReceipt: function (receipt) {
      if (confirm(this.api.trans('__.are you sure?')))
        this.api.post(`receipt/${receipt.id}/email`)
          .then((data) => {
            this.success_email = true
          })
          .catch(console.error);
    },
    reportPayment: function () {
      $.post({
        'url': window.url + '/api/invoices/' + this.invoice.id + '/Payment',
        'method': 'POST',
        data: this.payment
      })
        .then((data) => {
          console.log(data);
          Materialize.toast(trans('literals.payment') + " " + trans('literals.sent'), 4000, "rounded success");
        })
        .catch((err) => {
          console.error(err);
          Materialize.toast(trans('__.error'), 4000, "rounded error");
        });
    },
    moment(date) {
      return moment(date)
    },
  },
  computed: {
    debt: function () {
      var total = 0
      this.invoices.forEach(inv => {
        if (inv.status === 'unpaid' || inv.status === 'partially paid' || inv.status === 'overdue')
          total += inv.total
      })
      return total
    },
    total: function () {
      var total = 0
      this.invoices.forEach(inv => {
        total += inv.total
      })
      return total
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
