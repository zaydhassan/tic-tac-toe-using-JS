import Vue from 'vue'
import App from './App.vue'
import {
  Button,
  ButtonGroup,
  Container,
  Header,
  Main,
  Aside,
  Dialog,
  Row,
  Col,
  Divider,
  Popover
} from 'element-ui';
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Aside);
Vue.use(Dialog);
Vue.use(Row);
Vue.use(Col);
Vue.use(Divider);
Vue.use(Popover);
new Vue({
  render: h => h(App),
}).$mount('#app')



