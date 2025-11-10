import React, { useMemo, useState } from 'react';
import { Container, Flex, Heading, Text, Button } from '@dynatrace/strato-components';
import { DataTableV2, DQLEditor } from '@dynatrace/strato-components-preview';
import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

/**
 * Dashboard - Deep Dive Presents (D1-ESA)
 * A starter template for building Dynatrace Gen3 applications
 * Features:
 * - DQL Editor for querying Grail data
 * - Multiple tabs for organizing content
 * - Real-time data execution
 */

interface LogDataPoint {
  timestamp: string;
  content?: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [dql, setDql] = React.useState<string>(`fetch logs
| limit 100`);
  const [dqlResult, setDqlResult] = React.useState<LogDataPoint[] | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab1');

  const runDql = async () => {
    setLoading(true);
    setError(null);

    try {
      // Execute real DQL query
      const response = await queryExecutionClient.queryExecute({
        body: {
          query: dql,
          requestTimeoutMilliseconds: 30000,
          enablePreview: true
        }
      });

      // Parse the response
      if (response.result && response.result.records) {
        const records = response.result.records;
        setDqlResult(records as LogDataPoint[]);
      } else {
        setError('No data returned from query');
      }
    } catch (e: any) {
      console.error('DQL query error:', e);
      setError(`Failed to execute DQL query: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for table display
  const tableData = useMemo(() => {
    if (!dqlResult) return [];
    return dqlResult.map((record, index) => ({
      id: index,
      ...record
    }));
  }, [dqlResult]);

  // Define table columns dynamically based on available data
  const tableColumns = useMemo(() => {
    if (!dqlResult || dqlResult.length === 0) return [];

    const firstRecord = dqlResult[0];
    const keys = Object.keys(firstRecord);

    return keys.map(key => ({
      id: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      accessor: key as any,
      autoWidth: true,
      resizable: true,
    }));
  }, [dqlResult]);

  return (
    <Flex flexDirection="column" gap={24} padding={24}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={1}>Deep Dive Presents (D1-ESA)</Heading>
        <Flex
          flexDirection="column"
          alignItems="flex-end"
          gap={4}
        >
          <Text style={{
            fontSize: '12px',
            color: 'var(--dt-colors-text-neutral-default, #b4b4be)',
            fontStyle: 'italic'
          }}>
            App by Dynatrace One - ESA OSS
          </Text>
          <Text style={{
            fontSize: '11px',
            color: 'var(--dt-colors-text-neutral-default, #b4b4be)',
            fontStyle: 'italic'
          }}>
            by Brett Hofer
          </Text>
        </Flex>
      </Flex>

      {/* Information Section */}
      <Container style={{
        backgroundColor: 'var(--dt-colors-background-container-default, #25273d)',
        padding: 'var(--dt-spacings-size-24, 24px)',
        borderRadius: 'var(--dt-borders-radius-default, 4px)',
        border: '2px solid var(--dt-colors-accent-primary-default, #6c5dd3)'
      }}>
        <Heading level={2} style={{ marginBottom: 16 }}>Welcome to the Dynatrace Gen3 App Template</Heading>
        <Text style={{
          color: 'var(--dt-colors-text-neutral-default, #f0f0f5)',
          lineHeight: 1.6,
          marginBottom: 16
        }}>
          This template provides a starting point for building your own Dynatrace Gen3 applications. It includes the following features:
        </Text>
        <ul style={{
          color: 'var(--dt-colors-text-neutral-default, #f0f0f5)',
          lineHeight: 1.8,
          marginLeft: 20
        }}>
          <li><strong>DQL Editor:</strong> Query data from Grail using Dynatrace Query Language</li>
          <li><strong>Tabbed Interface:</strong> Organize your content across multiple tabs</li>
          <li><strong>Data Table:</strong> Display query results in a sortable, paginated table</li>
          <li><strong>Dynatrace Strato Components:</strong> Pre-configured with the Dynatrace design system</li>
          <li><strong>TypeScript Support:</strong> Fully typed for better development experience</li>
          <li><strong>Real-time Data:</strong> Execute DQL queries and display results instantly</li>
        </ul>
        <Text style={{
          color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
          fontSize: '14px',
          marginTop: 16,
          fontStyle: 'italic'
        }}>
          <strong>Getting Started:</strong> Copy this template directory to create a new app project. Update the app.config.json with your app's unique ID and name, then customize the components to fit your use case.
        </Text>
      </Container>

      <Flex
        flexDirection="column"
        gap={16}
        style={{
          backgroundColor: 'var(--dt-colors-background-container-default, #25273d)',
          padding: 'var(--dt-spacings-size-16, 16px)',
          borderRadius: 'var(--dt-borders-radius-default, 4px)'
        }}
      >
        <Heading level={3}>DQL Editor</Heading>
        <Text style={{
          color: 'var(--dt-colors-text-neutral-default, #f0f0f5)',
          marginBottom: 'var(--dt-spacings-size-8, 8px)'
        }}>
          Query data from Grail using DQL. Try modifying the query below to fetch different data.
        </Text>
        <DQLEditor
          value={dql}
          onChange={setDql}
          placeholder='Try "fetch logs", "fetch events", or "timeseries"'
          aria-label="Enter a DQL query"
          data-testid="dql-editor"
        />
        <Flex gap={8} alignItems="center">
          <Button onClick={runDql} disabled={loading} variant="emphasized">
            {loading ? 'Running...' : 'Run DQL'}
          </Button>
          {error && <Text textStyle="base" style={{ color: 'var(--dt-colors-text-critical-default, #ee3d48)' }}>{error}</Text>}
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Flex gap={8} style={{ borderBottom: '1px solid var(--dt-colors-border-neutral-default, #3d3f5c)' }}>
          <Button
            variant="default"
            onClick={() => setActiveTab('tab1')}
            style={{
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'tab1' ? '2px solid var(--dt-colors-accent-primary-default, #6c5dd3)' : 'none',
              opacity: activeTab === 'tab1' ? 1 : 0.7
            }}
          >
            Tab 1
          </Button>
          <Button
            variant="default"
            onClick={() => setActiveTab('tab2')}
            style={{
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'tab2' ? '2px solid var(--dt-colors-accent-primary-default, #6c5dd3)' : 'none',
              opacity: activeTab === 'tab2' ? 1 : 0.7
            }}
          >
            Tab 2
          </Button>
          <Button
            variant="default"
            onClick={() => setActiveTab('tab3')}
            style={{
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'tab3' ? '2px solid var(--dt-colors-accent-primary-default, #6c5dd3)' : 'none',
              opacity: activeTab === 'tab3' ? 1 : 0.7
            }}
          >
            Tab 3
          </Button>
        </Flex>

        {activeTab === 'tab1' && (
          <Container style={{
            backgroundColor: 'var(--dt-colors-background-container-default, #25273d)',
            padding: 'var(--dt-spacings-size-16, 16px)',
            borderRadius: 'var(--dt-borders-radius-default, 4px)'
          }}>
            {tableData.length > 0 ? (
              <>
                <Text style={{
                  color: 'var(--dt-colors-text-neutral-default, #f0f0f5)',
                  marginBottom: 'var(--dt-spacings-size-8, 8px)'
                }}>
                  Displaying {tableData.length} rows from the DQL query
                </Text>
                <div style={{ width: '100%' }}>
                  <DataTableV2 data={tableData} columns={tableColumns} resizable>
                    <DataTableV2.Pagination defaultPageSize={50} pageSizeOptions={[25, 50, 100, 200]} />
                  </DataTableV2>
                </div>
              </>
            ) : (
              <Text style={{ color: 'var(--dt-colors-text-neutral-default, #f0f0f5)' }}>
                No data available. Click "Run DQL" to execute the query.
              </Text>
            )}
          </Container>
        )}

        {activeTab === 'tab2' && (
          <Container style={{
            backgroundColor: 'var(--dt-colors-background-container-default, #25273d)',
            padding: 'var(--dt-spacings-size-16, 16px)',
            borderRadius: 'var(--dt-borders-radius-default, 4px)',
            minHeight: '200px'
          }}>
            <Text style={{
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              fontStyle: 'italic'
            }}>
              Tab 2 content - Add your custom components here
            </Text>
          </Container>
        )}

        {activeTab === 'tab3' && (
          <Container style={{
            backgroundColor: 'var(--dt-colors-background-container-default, #25273d)',
            padding: 'var(--dt-spacings-size-16, 16px)',
            borderRadius: 'var(--dt-borders-radius-default, 4px)',
            minHeight: '200px'
          }}>
            <Text style={{
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              fontStyle: 'italic'
            }}>
              Tab 3 content - Add your custom components here
            </Text>
          </Container>
        )}
      </Flex>
    </Flex>
  );
};

export default Dashboard;
