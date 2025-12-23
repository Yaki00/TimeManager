import { Button, Input , Modal, Form, message } from "antd";
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useMemo } from "react";
import styled from 'styled-components';
import { Breadcrumbs } from "../utils/Breadcrumb";
import { CreateTeamForm } from "../components/form/CreateTeamForm";
import { ButtonStyle } from "../utils/ButtonStyle";
import { useUserStore } from "../zustand/store";
import { useCreateTeam, useDeleteTeam, useGetTeams } from "../service/useTeam";
import { TeamCard } from "../components/TeamCard";
import { columnsTeam } from "../components/column/ColumnsTeam";
import { TableStyle } from "../utils/TableStyle";
import { Header, PageWrapper, ScrollableContent } from "../utils/layoutStyle";

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 4px 4px 4px;
  border-radius: 10px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .ant-input-affix-wrapper {
    border: none;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    min-width: 280px;
    height: 40px;
    
    &:hover, &:focus, &.ant-input-affix-wrapper-focused {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    input {
      font-weight: 500;
      font-size: 14px;
    }
  }
`;

const ViewToggleGroup = styled.div`
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ViewButton = styled(Button)`
  border: none !important;
  border-radius: 6px !important;
  background: ${props => props.$active ? '#f1f5f9' : 'transparent'} !important;
  color: ${props => props.$active ? '#9191fa' : '#64748b'} !important;
  transition: all 0.3s ease !important;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'} !important;
  &:hover {
    color: ${props => props.$active ? '#9191fa' : '#1e293b'} !important;
    background: ${props => props.$active ? '#f1f5f9' : '#f8fafc'} !important;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  margin-top: 24px;
  padding-bottom: 24px;
`;


const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;

  span {
    color: #9191fa;
    font-weight: 700;
    font-size: 16px;
  }
`;

export const Teams = () => {
	const preference = useUserStore((state) => state.user.preferences.filterTeams);
	const setPreferences = useUserStore((state) => state.setPreferences);
	const user = useUserStore((state) => state.user);
	
	const { data: teamsData, isLoading: loadingTeams } = useGetTeams();
	
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [teamToDelete, setTeamToDelete] = useState(null);
	const [form] = Form.useForm();

	const { createTeamAsync, isLoading } = useCreateTeam();
	const {deleteTeamAsync, isLoading: isDeleting} = useDeleteTeam();


	const filteredTeams = useMemo(() => {
		if (!teamsData) return [];
		if (!searchTerm) return teamsData;
		return teamsData.filter(team => 
			team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [teamsData, searchTerm]);

	if (loadingTeams) return <div>Chargement des équipes...</div>;
	if (!teamsData) return <div>Aucune équipe trouvée.</div>;


	const onFinish = async (values) => {
		try {
			const newTeam = {
				ownerId: user.id,
				teamName: values.teamName,
				description: values.description,
				members: 
					values.members.map(memberId => ({
						userId: memberId,
						isLead: false,
					}))
			};
			await createTeamAsync(newTeam);
			message.success(`L'équipe "${values.teamName}" a été créée avec succès!`);
			form.resetFields(); 
			setIsModalOpen(false);
		} catch (error) {
			message.error(error);
		}
	};

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		form.resetFields();
		setIsModalOpen(false);
	};

	const toggleView = () => {
		const newPreference = preference === "card" ? "table" : "card";
		setPreferences({ filterTeams: newPreference });
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
	}

	const Footer = () => {
		return (
				<StatItem>
					Total des équipes : <span>{filteredTeams.length}</span>
				</StatItem>
		);
	}

	const handleDelete = (record) => {
		setTeamToDelete(record);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!teamToDelete) return;
		
		try {
			await deleteTeamAsync(teamToDelete.id);
			message.success(`L'équipe "${teamToDelete.teamName}" a été supprimée avec succès !`);
			setIsDeleteModalOpen(false);
			setTeamToDelete(null);
		} catch (error) {
			message.error("Échec de la suppression de l'équipe. Veuillez réessayer.");
		}
	};

	const cancelDelete = () => {
		setIsDeleteModalOpen(false);
		setTeamToDelete(null);
	};

	const columnsTeams = columnsTeam(handleDelete, isDeleting, user.role);

	return (
		<PageWrapper>
			<Header>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", path: "/" },
						{ label: "Teams" },
					]}
				/>
				<h1>Gestion des Équipes</h1>
				<ToolbarContainer>
					<LeftActions>
						<SearchContainer>
							<Input
								prefix={<SearchOutlined style={{ color: '#64748b' }} />}
								placeholder="Rechercher une équipe..."
								onChange={handleSearch}
								allowClear
							/>
						</SearchContainer>
						<ViewToggleGroup>
							<ViewButton
								icon={<AppstoreOutlined />}
								$active={preference === "card"}
								onClick={() => preference !== "card" && toggleView()}
							/>
							<ViewButton
								icon={<UnorderedListOutlined />}
								$active={preference === "table"}
								onClick={() => preference !== "table" && toggleView()}
							/>
						</ViewToggleGroup>
					</LeftActions>
					<ButtonStyle
						type="primary"
						icon={<PlusOutlined />}
						onClick={showModal}
					>
						Créer une équipe
					</ButtonStyle>
				</ToolbarContainer>
			</Header>
			<ScrollableContent>
				<Modal
					title={
						<span style={{ 
							fontWeight: 700, 
							fontSize: 20,
							background: 'linear-gradient(135deg, #9191fa 0%, #C0C0F6 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text'
						}}>
							Création d'une nouvelle équipe
						</span>
					}
					destroyOnHidden={true}
					open={isModalOpen}
					onCancel={handleCancel}
					centered
					footer={null}
					width={650}
					styles={{
						body: {
							background: "linear-gradient(135deg, #f8f9ff 0%, #f1f5f9 100%)",
							borderRadius: 12,
							padding: "32px 24px"
						}
					}}
				>
					<CreateTeamForm 
						form={form}
						onFinish={onFinish}
					/>
				</Modal>
				<Modal
					title={
						<span style={{ 
							fontWeight: 700, 
							fontSize: 20,
							color: '#ff4d4f'
						}}>
							Confirmer la suppression
						</span>
					}
					open={isDeleteModalOpen}
					onOk={confirmDelete}
					onCancel={cancelDelete}
					okText="Supprimer"
					cancelText="Annuler"
					okButtonProps={{ danger: true, loading: isDeleting }}
					centered
					width={500}
					styles={{
						body: {
							padding: "24px"
						}
					}}
				>
					<p style={{ fontSize: 16, marginBottom: 8 }}>
						Êtes-vous sûr de vouloir supprimer l'équipe <strong>"{teamToDelete?.teamName}"</strong> ?
					</p>
					<p style={{ fontSize: 14, color: '#8c8c8c', margin: 0 }}>
						Cette action est irréversible et supprimera définitivement l'équipe et toutes ses données associées.
					</p>
				</Modal>
				{preference === "card" ? (
					<CardsGrid>
						{filteredTeams.map(team => (
							<TeamCard key={team.id} team={team} handleDelete={handleDelete} userRole={user.role}/>
						))}
					</CardsGrid>
				) : (
					<div style={{margin:"24px 0"}}>
						<TableStyle 
							columns={columnsTeams} 
							dataSource={filteredTeams} 
							pagination={false}
							footer={() => <Footer />}
							scroll={{ y: 450 }}
						/>
					</div>
				)}
			</ScrollableContent>
		</PageWrapper>
	);
}