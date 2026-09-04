import Graph from './src/graph.js';
import Node from './src/node.js';
import Edge from './src/edge.js';

const graph = new Graph(g => {
  const alice = new Node({ id: 1, label: 'person', props: { name: 'Age List', age: [30,20,11,22,33] } });
  const bob = new Node({ id: 2, label: 'person', props: { name: 'Bob', age: 25 } });
  const carol = new Node({ id: 3, label: 'person', props: { name: 'Carol', age: 28 } });

  g.setNode(alice);
  g.setNode(bob);
  g.setNode(carol);

  g.setEdge(new Edge({ id: 1, from: alice, to: bob, label: 'knows', props: { since: 2020 } }));
  g.setEdge(new Edge({ id: 2, from: alice, to: carol, label: 'knows', props: { since: 2022 } }));
});

console.log('All people:');
console.log(graph.n('person').all().map(n => n.props.name));

console.log('\nAlice\'s friends:');
const friends = graph.n(1).out('knows').all();
console.log(friends.map(n => n.props.name));

console.log('\nPeople older than 26:');
const adults = graph.n('person').filter(n => n.props.age > 26).all();
console.log(adults.map(n => `${n.props.name} (${n.props.age})`));
