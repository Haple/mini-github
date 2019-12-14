import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';
import { Loading, Owner, IssueList, Selection } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    await this.getRepository(repoName, state);
  }

  async getRepository(repoName, state) {
    this.setState({
      loading: true,
    });
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      state,
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleOptionChange = async e => {
    const {
      repository: { full_name: fullName },
    } = this.state;
    const state = e.target.value;
    await this.getRepository(fullName, state);
  };

  render() {
    const { repository, issues, loading, state } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Selection>
          <div>
            <span>Tudo</span>
            <input
              type="radio"
              name="state"
              value="all"
              onChange={this.handleOptionChange}
              checked={state === 'all'}
            />
          </div>
          <div>
            <span>Aberto</span>
            <input
              type="radio"
              name="state"
              value="open"
              onChange={this.handleOptionChange}
              checked={state === 'open'}
            />
          </div>
          <div>
            <span>Fechado</span>
            <input
              type="radio"
              name="state"
              value="closed"
              onChange={this.handleOptionChange}
              checked={state === 'closed'}
            />
          </div>
        </Selection>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={issue.html_url}
                  >
                    {issue.title}
                  </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
