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
              <tr @click.stop="seeInvoice(props.item)">
                <td>
                  <a href="#/invoices" @click="seeInvoice(props.item)">
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
                  <v-btn @click.stop="pay(props.item)" v-if="props.item.status !== 'paid'" v-tooltip:bottom="{ html: api.trans('__.report payment')}" icon>
                    <v-icon class="primary--text">credit_card</v-icon>
                  </v-btn>
                  <v-btn v-if="props.item.receipts.length!==0 " v-tooltip:bottom="{ html: (api.trans('literals.download') +  ' ' + api.trans('literals.receipt')) }" icon :href="api.url + 'receipt/'+ props.item.receipts[0].id +'/pdf?token='+ api.user.token" target="receipt" @click.stop="null">
                    <v-icon class="green--text" fa>file-text-o</v-icon>
                  </v-btn>
                  <v-btn v-tooltip:bottom="{ html: api.trans('literals.download') }" icon :href="api.url + 'invoice/'+ props.item.id +'/pdf?token='+ api.user.token" target="invoice" @click.stop="null">
                    <v-icon class="red--text" fa>file-pdf-o</v-icon>
                  </v-btn>
                  <v-btn icon v-tooltip:bottom="{ html: api.trans('__.send email') }" small @click.stop="sendMailInvoice(props.item)">
                    <v-icon class="">email</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>

        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog fullscreen v-model="see_dialog">
      <v-toolbar light>
        <v-toolbar-title>
          {{api.trans('literals.invoice')}} # {{ invoice.number }}
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn icon @click.native="see_dialog=false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-container fluid>
            <v-layout wrap>
              <v-flex xs12 sm8 md8 lg9>
                <v-card hover>

                  <v-data-table :headers="headers_items" :pagination.sync="pagination_items" :items="invoice.items" class="text-xs-right" hide-actions>
                    <template slot="items" scope="props">
                      <td>{{props.item.concept}}</td>
                      <td>{{props.item.amount}}</td>
                      <td>{{props.item.quantity}}</td>
                    </template>
                  </v-data-table>
                </v-card>
              </v-flex>
              <v-flex xs12 sm4 md4 lg3 v-if="see_dialog">
                <v-card hover>

                  <chartjs-bar :datalabel="api.trans('literals.charges')" :backgroundcolor="colors" :labels="labels" :data="values" :bind="true"></chartjs-bar>
                </v-card>
              </v-flex>
              <v-flex xs9>
                <h3 class="headline dark--text text-xs-center">
                  {{api.trans('literals.status')}}:
                  <span :class="(invoice.status=='paid'? 'green' : 'red') +'--text'">
                    {{ api.trans('literals.'+invoice.status)}}
                  </span>
                </h3>
              </v-flex>
            </v-layout>

            <v-speed-dial v-model="fab" fixed bottom right direction="top" :transition="'scale'">
              <v-btn slot="activator" style="right:5px" class="blue darken-2" dark hover fab v-model="fab">
                <v-icon>menu</v-icon>
                <v-icon>close</v-icon>
              </v-btn>
              <v-btn v-if="invoice.status !== 'paid'" @click.native="pay(invoice)" fab dark small class="green" style="right:5px" v-tooltip:left="{html:api.trans('__.report payment')}">
                <v-icon>credit_card</v-icon>
              </v-btn>
              <v-btn :href="api.url + 'invoice/'+ invoice.id +'/pdf?token='+ api.user.token" target="invoice" fab dark small class="red" style="right:5px" v-tooltip:left="{html:api.trans('__.print as pdf')}">
                <v-icon fa>file-pdf-o</v-icon>
              </v-btn>
              <v-btn @click="sendMailInvoice(invoice)" fab dark small class="indigo" style="right:5px" v-tooltip:left="{html:api.trans('__.send by email')}">
                <v-icon>mail</v-icon>
              </v-btn>
            </v-speed-dial>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="see_payment" scrollable>
      <v-card>
        <v-card-title class="primary">
          <h6 class="white--text">{{api.trans('literals.invoice')}} #{{invoice.number}}</h6>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="see_payment=false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field prepend-icon="attach_money" :max="invoice.total" min="0" v-model="payment.amount" type="number" :label="api.trans('literals.amount')"></v-text-field>
          <v-select v-bind:items="transactions" v-model="payment.transaction" prepend-icon="account_balance_wallet" label="Select" single-line bottom></v-select>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn flat primary @click.native="reportPayment(invoice)" :loading="proccesingPayment">
            {{api.trans('__.report payment')}}
          </v-btn>

          <v-btn flat primary @click.native="see_payment=false">
            {{api.trans('crud.cancel')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar :timeout="4000" top right v-model="success_email">
      {{api.trans('literals.email') + " " + api.trans('literals.sent')}}
    </v-snackbar>

    <v-snackbar :timeout="4000" top right v-model="payment_success">
      {{api.trans('literals.payment') + " " + api.trans('literals.accept')}}
    </v-snackbar>

  </v-container>
</template>

<script>
var api = require('../services/api.js')
const moment = require('moment')
window.__ = require('underscore')._
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
      see_dialog: false,
      see_payment: false,
      success_email: false,
      payment_success: false,
      proccesingPayment: false,
      fab: false,
      invoice: {},
      payment: {},
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
      pagination_items: { sortBy: 'amount', page: 1, rowsPerPage: 50, descending: false },
      headers_items: [
        { text: api.trans('literals.concept'), value: 'concept' },
        { text: api.trans('literals.amount'), value: 'amount' },
        { text: api.trans('literals.quantity'), value: 'quantity' },
      ],
      api: api,
      labels: [],
      values: [],
      transactions: [
        { value: "deposit", text: api.trans('literals.deposit') },
        { value: "check", text: api.trans('literals.check') },
        { value: "cash", text: api.trans('literals.cash') },
        { value: "credit card", text: api.trans('literals.credit card') },
        { value: "debit card", text: api.trans('literals.debit card') },
        { value: "other", text: api.trans('literals.other') }
      ],
      colors: ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#009688'],
    }
  },
  methods: {
    getInvoices() {
      this.loading = false
      this.api.get('invoices?with[]=receipts&with[]=items&where[residence_id]=' + this.api.user.residence_id)
        .then((response) => {
          this.loading = true
          console.log(response.data)
          this.invoices = this.api.residence.invoices = response.data
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
    moment(date) {
      return moment(date)
    },
    seeInvoice(invoice) {
      this.invoice = invoice;
      this.labels = __.pluck(this.invoice.items, 'concept')
      this.values = __.pluck(this.invoice.items, 'amount')
      setTimeout(() => {
        this.see_dialog = true
      }, 100)
    },
    pay(invoice) {
      this.see_dialog = false
      this.invoice = invoice
      this.payment = {
        amount: this.invoice.total - this.invoice.partially_paid,
        transaction: 'deposit',
      }
      console.log(invoice)
      setTimeout(() => {
        this.see_payment = true
      }, 100)
    },
    reportPayment(invoice) {
      this.proccesingPayment = true
      this.api.post(`invoices/${invoice.id}/Payment`)
        .then((response) => {
          console.log(response.data)
          this.see_dialog = false
          this.see_payment = false
          this.payment_success = true
          this.proccesingPayment = false
          this.getInvoices()
        })
        .catch(console.error)
    }
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
