export default class extends Relay.Route {
  static path = '/';
  static queries = {
    viewer: (Component) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('game')}, // was "viewer"
        },
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}
