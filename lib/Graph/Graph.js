import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import d3 from 'd3';
import classNames from 'classnames/bind';
import styles from './Graph.css'

import NodeComponent from '../Node/Node';
import EdgeComponent from '../Edge/Edge';

let Node = React.createFactory(NodeComponent);
let Edge = React.createFactory(EdgeComponent);

/**
 * 
 */
class Graph extends Component {

    constructor(props) {
        super(props);

        this.parentWidth = document.body.clientWidth;
    }

    /**
     * Gets nodes from state
     * @return {Array}
     */
    _getNodes() {
        let state = this.context.store.getState();

        return state.nodes;
    }

    /**
     * Gets edges from state
     * @return {Array}
     */
    _getEdges() {
        let state = this.context.store.getState();

        return state.edges;
    }

    componentDidMount() {

        this.el = ReactDOM.findDOMNode(this);
        this.svgEl = this.refs['graph'];
        this.d3El = d3.select(this.svgEl);
        this.parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;

        // Draw edges between nodes
        this._getEdges().forEach((edgesProps) => {
            let sourceNode = this.refs[`node_${edgesProps.source}`];
            let targetNode = this.refs[`node_${edgesProps.target}`];
            let edge = this.refs[`edge_${edgesProps.source}_${edgesProps.target}`];

            if (sourceNode && targetNode && edge) {
                edge.build(sourceNode, targetNode);
                sourceNode.addEdge('output', edge);
                targetNode.addEdge('input', edge);
            }
        });
    }

    componentWillUnmount() {
        d3Chart.destroy(this.d3El);
    }

    handleClick(event) {
        // deselect all nodes
        this._getNodes().forEach((nodeProps, index) => {
            let node = this.refs[`node_${nodeProps.id}`];

            if (node.el === event.target.parentNode) {
                return;
            }
            
            this.refs[`node_${nodeProps.id}`].deselect();
        });
    }

    render() {
        const { store } = this.context;
        let graph = [];
        let cx = classNames.bind(styles);
        let className = cx({
            root: true,
            root_light: true
        });

        this._getEdges().forEach((edgeProps) => {
            graph.push(Edge({ref: `edge_${edgeProps.source}_${edgeProps.target}`}));
        });

        this._getNodes().forEach((nodeProps, index) => {
            nodeProps.x = Math.min(
                index * (90 + Math.floor(Math.random() * 10)) + 50,
                this.parentWidth - 100);
            nodeProps.y = Math.floor(Math.random() * 500);
            nodeProps.ref = 'node_' + nodeProps.id;

            graph.push(Node(nodeProps));
        });

        return (
            <div className={ className }>
                <svg ref="graph" 
                    className={ styles.svg }
                    onClick={ this.handleClick.bind(this) }>{ graph }</svg>
                { this.props.children }
            </div>
        );
    }
}

Graph.contextTypes = {
    store: PropTypes.object
}

export default Graph;
