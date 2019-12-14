import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  Selection,
  PaginationControl,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    this.setState({
      loading: true,
    });
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      this.getIssues(repoName, state),
    ]);

    this.setState({
      state,
      issues,
      repository: repository.data,
      loading: false,
    });
  }

  getIssues = async (repoName, state, page = 1) => {
    const { data: issues } = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page,
        per_page: 5,
      },
    });
    return issues;
  };

  handleOptionChange = async e => {
    const {
      repository: { full_name: repoName },
    } = this.state;
    const state = e.target.value;
    this.setState({
      loading: true,
    });
    const issues = await this.getIssues(repoName, state);

    this.setState({
      issues,
      state,
      page: 1,
      loading: false,
    });
  };

  handlePreviousPage = async () => {
    const {
      page,
      state,
      repository: { full_name: fullName },
    } = this.state;
    const issues = await this.getIssues(fullName, state, page - 1);
    this.setState({
      issues,
      page: page - 1,
    });
  };

  handleNextPage = async () => {
    const {
      page,
      state,
      repository: { full_name: fullName },
    } = this.state;
    const issues = await this.getIssues(fullName, state, page + 1);
    this.setState({
      issues,
      page: page + 1,
    });
  };

  render() {
    const { repository, issues, loading, state, page } = this.state;

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

        <PaginationControl>
          <button
            disabled={page <= 1}
            type="button"
            onClick={this.handlePreviousPage}
          >
            <FaArrowLeft />
          </button>
          <button type="button" onClick={this.handleNextPage}>
            <FaArrowRight />
          </button>
        </PaginationControl>
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
