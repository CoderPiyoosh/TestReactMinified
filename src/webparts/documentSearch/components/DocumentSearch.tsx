import * as React from 'react';
import styles from './DocumentSearch.module.scss';
import { IDocumentSearchProps } from './IDocumentSearchProps';
import { escape } from '@microsoft/sp-lodash-subset';
import DocumentSearchPage from './DocumentSearchPage'
export default class DocumentSearch extends React.Component<IDocumentSearchProps, {}> {
  public render(): React.ReactElement<IDocumentSearchProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      DocumentListId,
      context,
      TaskUserListId,
      MasterTaskListId,
    } = this.props;

    return (
      <>
        <DocumentSearchPage Selectedprops={this.props} />
      </>
    );
  }
}
