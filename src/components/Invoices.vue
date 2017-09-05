<template lang="jade">
v-container(fluid='')
  v-layout(wrap='')
    v-flex(xs12='', center='')
      h2.headline.text-xs-center(primary='')
        v-icon fa-files-o
        | {{api.trans('literals.invoices')}}
    v-flex(xs12='')
      v-card
        v-card-title
          v-layout(wrap='', align-center='')
            v-flex.text-xs-center(xs12='')
              span
                | {{api.trans('literals.percent')}}:
            v-flex.text-xs-center(xs12='')
              v-progress-circular.teal--text(v-bind:size='70 ', v-bind:width='10 ', v-bind:rotate='-90 ', v-bind:value=' total>\
              0 ? debt/total*100: 0')
                | {{(debt/total*100).toFixed(2)}}%
          v-spacer
          b  {{api.trans('literals.total')}} {{api.trans('literals.debt')}} :
          span  {{debt | currency }}
        v-data-table.hidden-xs-only.elevation-1.text-xs-right(:loading='!loading', :pagination.sync='pagination', :headers='headers', :items='invoices')
          template(slot='items', scope='props')
            tr(@click.stop='seeInvoice(props.item)')
              td
                a(href='#/invoices', @click='seeInvoice(props.item)')
                  | {{props.item.number}}
              td {{api.trans('__.'+props.item.type)}}
              td(v-if="props.item.type != 'residential'") {{ props.item.date | moment("dddd, MMMM D YYYY")}}
              td.text-capitalize(v-else='') {{ props.item.date | moment('MMMM/YYYY') }}
              td {{ props.item.total | currency }}
              td(:class="(props.item.status=='paid'?'green':'red') + '--text'")
                strong {{ api.trans('literals.'+props.item.status)}}
              td
                v-btn(@click.stop='pay(props.item)', v-if="props.item.status !== 'paid'", v-tooltip:bottom="{ html: api.trans('__.report payment')}", icon='')
                  v-icon.primary--text credit_card
                v-btn(v-if='props.item.receipts.length!==0 ', v-tooltip:bottom="{ html: (api.trans('literals.download') +  ' ' + api.trans('literals.receipt')) }", icon='', :href="api.url + 'receipt/'+ props.item.receipts[0].id +'/pdf?token='+ api.user.token", target='receipt', @click.stop='null')
                  v-icon.green--text fa-file-text-o
                v-btn(v-tooltip:bottom="{ html: api.trans('literals.download') }", icon='', :href="api.url + 'invoice/'+ props.item.id +'/pdf?token='+ api.user.token", target='invoice', @click.stop='null')
                  v-icon.red--text fa-file-pdf-o
                v-btn(icon='', v-tooltip:bottom="{ html: api.trans('__.send by mail') }", small='', @click.stop='sendMailInvoice(props.item)')
                  v-icon email
        v-list.hidden-sm-and-up(two-line subheader)
          v-subheader {{api.trans('literals.invoices')}}
          template(v-for="(invoice,index) in orderBy(invoices,'date',-1)")
            v-list-tile(avatar,:key="invoice.id")
              v-list-tile-avatar(@click.stop='seeInvoice(invoice)')
                v-icon.white--text(:class="invoice.status ==='paid'?'green':'red'") {{invoice.status !== 'paid'?'attach_money':'check'}}
              v-list-tile-content(@click.stop='seeInvoice(invoice)')
                v-list-tile-title {{api.trans('literals.invoice')}} # {{invoice.number}}
                v-list-tile-sub-title {{invoice.total | currency}}
              v-list-tile-action
                v-list-tile-action-text(v-if="invoice.type != 'residential'") {{ invoice.date | moment("dddd, MMMM D YYYY")}}
                v-list-tile-action-text.text-capitalize(v-else='') {{ invoice.date | moment('MMMM/YYYY') }}
                v-menu(offfset-y left)
                  v-btn(icon slot="activator"): v-icon more_vert
                  v-list
                    v-list-tile(@click.stop='pay(invoice)', v-if="invoice.status !== 'paid'")
                      v-list-tile-title
                        //- v-icon.primary--text credit_card
                        span &nbsp;{{api.trans('__.report payment')}}

                    v-list-tile(v-if='invoice.receipts.length!==0 ',:href="api.url + 'receipt/'+ invoice.receipts[0].id +'/pdf?token='+ api.user.token",target='receipt', @click.stop='null')
                      v-list-tile-title
                        //- v-icon.green--text fa-file-text-o
                        span &nbsp; {{api.trans('literals.download')}} {{api.trans('literals.receipt') }}
                    v-list-tile(:href="api.url + 'invoice/'+ invoice.id +'/pdf?token='+ api.user.token", target='invoice', @click.stop='null')
                      v-list-tile-title
                        //- v-icon.red--text fa-file-pdf-o
                        span &nbsp; {{api.trans('literals.download')}}
                    v-list-tile(@click.stop='sendMailInvoice(invoice)')
                      v-list-tile-title
                        //- v-icon email
                        span &nbsp; {{api.trans('__.send by mail')}}
            v-divider(v-if="index+1<invoices.length")

  v-dialog(fullscreen='', v-model='see_dialog')
    v-toolbar(light='')
      v-toolbar-title
        | {{api.trans('literals.invoice')}} # {{ invoice.number }}
      v-spacer
      v-btn(icon='', @click.native='see_dialog=false')
        v-icon close
    v-card
      v-container(fluid='')
        v-layout(wrap='')
          v-flex(xs12='', sm8='', md8='', lg9='')
            v-card.mx-1(hover='')
              v-data-table.text-xs-right(:headers='headers_items', :pagination.sync='pagination_items', :items='invoice.items', hide-actions='')
                template(slot='items', scope='props')
                  td {{props.item.concept}}
                  td {{props.item.amount}}
                  td {{props.item.quantity}}
          v-flex(xs12='', sm4='', md4='', lg3='', v-if='see_dialog')
            v-card.mx-1.mt-3(hover='')
              column-chart(:label="api.trans('literals.charges')", :stacked='true', :colors='colors', :data='values', :download='true')
          v-flex(xs9='')
            h3.headline.dark--text.text-xs-center
              | {{api.trans('literals.status')}}:
              span(:class="(invoice.status=='paid'? 'green' : 'red') +'--text'")
                | {{ api.trans('literals.'+invoice.status)}}
        v-speed-dial(v-model='fab', fixed='', bottom='', right='', direction='top', :transition="'scale'")
          v-btn.blue.darken-2(slot='activator', style='right:5px', dark='', hover='', fab='', v-model='fab')
            v-icon menu
            v-icon close
          v-btn.green(v-if="invoice.status !== 'paid'", @click.native='pay(invoice)', fab='', dark='', small='', style='right:5px', v-tooltip:left="{html:api.trans('__.report payment')}")
            v-icon credit_card
          v-btn.red(:href="api.url + 'invoice/'+ invoice.id +'/pdf?token='+ api.user.token", target='invoice', fab='', dark='', small='', style='right:5px', v-tooltip:left="{html:api.trans('__.print as pdf')}")
            v-icon fa-file-pdf-o
          v-btn.indigo(@click='sendMailInvoice(invoice)', fab='', dark='', small='', style='right:5px', v-tooltip:left="{html:api.trans('__.send by email')}")
            v-icon mail
  v-dialog(v-model='see_payment', scrollable='')
    v-card(flat)
      v-card-title.primary
        h6.white--text {{api.trans('literals.invoice')}} # {{invoice.number}}
        v-spacer
        v-btn(icon='', dark='', @click='see_payment=false')
          v-icon close
      v-card-text
        v-text-field(prepend-icon='attach_money', :max='invoice.total', min='0', v-model='payment.amount', type='number', :label="api.trans('literals.amount')")
        v-select(v-bind:items='transactions', v-model='payment.transaction', prepend-icon='account_balance_wallet', label='Select', single-line='', bottom='')
      v-card-actions
        v-spacer
        v-btn(flat='', primary='', @click.native='reportPayment(invoice)', :loading='proccesingPayment')
          | {{api.trans('__.report payment')}}
        v-btn(flat='', primary='', @click.native='see_payment=false')
          | {{api.trans('crud.cancel')}}
  v-snackbar(:timeout='4000', top='', right='', v-model='success_email')
    | {{api.trans('literals.email') + " " + api.trans('literals.sent')}}
  v-snackbar(:timeout='4000', top='', right='', v-model='payment_success')
    | {{api.trans('literals.payment') + " " + api.trans('literals.accept')}}
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
      colors: ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B', '#009688', '#E91E63', '#9C27B0', '#3F51B5', '#FF5722'],
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
    sendMailInvoice: function(invoice) {
      if (confirm(this.api.trans('__.are you sure?')))
        this.api.post(`invoice/${invoice.id}/email`)
          .then((data) => {
            this.success_email = true
          })
          .catch(console.error);
    },
    sendMailReceipt: function(receipt) {
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
      var values = __.pluck(this.invoice.items, 'amount')
      this.values = []
      this.labels.forEach((label, index) => {
        this.values[this.values.length] = { name: label, data: {} }
        this.values[this.values.length - 1].data[label] = values[index]
      });
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
      this.api.post(`invoices/${invoice.id}/Payment`, this.payment)
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
    debt: function() {
      var total = 0
      this.invoices.forEach(inv => {
        if (inv.status === 'unpaid' || inv.status === 'partially paid' || inv.status === 'overdue')
          total += inv.total
      })
      return total
    },
    total: function() {
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
