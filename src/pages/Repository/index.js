import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';
import { Loading, Owner, IssueList, IssueFilter, PageControls } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'open', label: 'Abertas', active: false },
      { state: 'closed', label: 'Fechadas', active: false },
    ],
    activeFilterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filters, activeFilterIndex } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters[activeFilterIndex].state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      issues: issues.data,
      repository: repository.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filters, activeFilterIndex, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const { data: issues } = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[activeFilterIndex].state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues });
  };

  handleFilterClick = async activeFilterIndex => {
    await this.setState({ activeFilterIndex, page: 1 });
    await this.loadIssues();
  };

  handlePageChange = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    await this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      activeFilterIndex,
      page,
    } = this.state;

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

        <IssueList>
          <IssueFilter active={activeFilterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterClick(index)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
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

        <PageControls>
          <button
            disabled={page <= 1}
            type="button"
            onClick={() => this.handlePageChange('back')}
          >
            <FaArrowLeft />
          </button>
          <span>Página {page}</span>
          <button type="button" onClick={() => this.handlePageChange('next')}>
            <FaArrowRight />
          </button>
        </PageControls>
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
