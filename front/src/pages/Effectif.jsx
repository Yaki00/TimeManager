import { Input, Select, Modal, Form, message } from "antd";
import { SearchOutlined, UserOutlined, FilterOutlined } from '@ant-design/icons';
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import styled from 'styled-components';
import { Breadcrumbs } from "../utils/Breadcrumb";
import { useUsers, useUpdateUser, useDeleteUser, useUpdateUserRole, useUpdateUserTeams } from "../service/useUser";
import { useGetTeams } from "../service/useTeam";
import { columnsEffectif } from "../components/column/ColumnsEffectif";
import { TableStyle } from "../utils/TableStyle";
import { Header, PageWrapper, ScrollableContent } from "../utils/layoutStyle";
import { ButtonStyle } from "../utils/ButtonStyle";

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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .ant-select {
    min-width: 200px;
    
    .ant-select-selector {
      border: none !important;
      background: white !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      height: 40px !important;
      display: flex;
      align-items: center;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
      }
    }

    &.ant-select-focused .ant-select-selector {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
    }
  }

  .filter-label {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
  }
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

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

export const Effectif = () => {
	const navigate = useNavigate();
	const { users, loadingUsers } = useUsers();
	const { data: teamsData, isLoading: loadingTeams } = useGetTeams();
	const { updateUserAsync, loadingUpdateUser } = useUpdateUser();
	const { deleteUserAsync, loadingDeleteUser } = useDeleteUser();
	const { updateUserRoleAsync } = useUpdateUserRole();
	const { updateUserTeamsAsync } = useUpdateUserTeams();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState(null);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [displayedUsers, setDisplayedUsers] = useState([]);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [form] = Form.useForm();

	const filteredUsers = useMemo(() => {
		if (!users) return [];
		
		let filtered = [...users];
		
		// Filtre par recherche textuelle
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(user => 
				user.firstName?.toLowerCase().includes(term) ||
				user.lastName?.toLowerCase().includes(term) ||
				user.email?.toLowerCase().includes(term) ||
				user.phoneNumber?.toLowerCase().includes(term)
			);
		}
		
		// Filtre par rôle
		if (selectedRole) {
			filtered = filtered.filter(user => user.role === selectedRole);
		}
		
		// Filtre par équipe
		if (selectedTeam) {
			filtered = filtered.filter(user => 
				user.teams?.some(team => team.id === selectedTeam)
			);
		}
		
		return filtered;
	}, [users, searchTerm, selectedRole, selectedTeam]);

	useEffect(() => {
		if (filteredUsers.length > 0 && displayedUsers.length === 0) {
			setDisplayedUsers(filteredUsers);
		}
	}, [filteredUsers]);

	const stats = useMemo(() => {
		const dataToUse = displayedUsers.length > 0 ? displayedUsers : filteredUsers;
		if (!dataToUse || dataToUse.length === 0) return { total: 0, responsable: 0, manager: 0, employer: 0 };
		
		return {
			total: dataToUse.length,
			responsable: dataToUse.filter(u => u.role === 'Responsable').length,
			manager: dataToUse.filter(u => u.role === 'Manager').length,
			employer: dataToUse.filter(u => u.role === 'Employer').length,
		};
	}, [filteredUsers, displayedUsers]);

	if (loadingUsers || loadingTeams) return <div>Chargement des données...</div>;
	if (!users) return <div>Aucun membre trouvé.</div>;

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setDisplayedUsers([]);
	};

	const handleRoleChange = (value) => {
		setSelectedRole(value);
		setDisplayedUsers([]);
	};

	const handleTeamChange = (value) => {
		setSelectedTeam(value);
		setDisplayedUsers([]);
	};

	const handleTableChange = (pagination, filters, sorter, extra) => {
		setDisplayedUsers(extra.currentDataSource || []);
	};

	const roleOptions = [
		{ label: 'Tous les rôles', value: null },
		{ label: 'Responsable', value: 'Responsable' },
		{ label: 'Manager', value: 'Manager' },
		{ label: 'Employé', value: 'Employer' },
	];

	const teamOptions = [
		{ label: 'Toutes les équipes', value: null },
		...(teamsData?.map(team => ({
			label: team.teamName,
			value: team.id,
		})) || []),
	];

	const handleDetail = (user) => {
		navigate(`/effectif/${user.id}`);
	};

	const handleEdit = (user) => {
		setSelectedUser(user);
		form.setFieldsValue({
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phoneNumber: user.phoneNumber,
			contractType: user.contractType,
			role: user.role,
			teams: user.teams?.map(t => t.id) || [],
		});
		setIsEditModalOpen(true);
	};

	const handleDelete = async (user) => {
		try {
			await deleteUserAsync(user.id);
			message.success(`L'utilisateur ${user.firstName} ${user.lastName} a été supprimé avec succès !`);
		} catch (error) {
			message.error("Échec de la suppression de l'utilisateur. Veuillez réessayer.");
		}
	};

	const handleEditSubmit = async (values) => {
		try {
			const updateData = {
				id: selectedUser.id,
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				phoneNumber: values.phoneNumber,
				contractType: values.contractType,
			};

			console.log("Données du formulaire:", values);
			console.log("Utilisateur sélectionné:", selectedUser);

			// Mettre à jour les informations de base
			await updateUserAsync(updateData);

			// Si le rôle est modifié, appeler l'API spécifique
			if (values.role && values.role !== selectedUser.role) {
				console.log("Modification du rôle:", values.role);
				await updateUserRoleAsync({ 
					userId: selectedUser.id, 
					role: values.role 
				});
			}

			// Si les équipes sont modifiées, appeler l'API spécifique
			if (values.teams !== undefined) {
				const currentTeamIds = selectedUser.teams?.map(t => t.id).sort() || [];
				const newTeamIds = [...values.teams].sort();
				const hasChanged = JSON.stringify(currentTeamIds) !== JSON.stringify(newTeamIds);
				
				console.log("Équipes actuelles:", currentTeamIds);
				console.log("Nouvelles équipes:", newTeamIds);
				console.log("Équipes modifiées?", hasChanged);
				
				if (hasChanged) {
					console.log("Appel API updateUserTeams avec:", { 
						userId: selectedUser.id, 
						teams: values.teams 
					});
					await updateUserTeamsAsync({ 
						userId: selectedUser.id, 
						teams: values.teams 
					});
					console.log("Équipes mises à jour avec succès!");
				}
			}

			message.success(`L'utilisateur ${values.firstName} ${values.lastName} a été modifié avec succès !`);
			setIsEditModalOpen(false);
			form.resetFields();
		} catch (error) {
			console.error("Erreur lors de la modification:", error);
			message.error(`Échec de la modification de l'utilisateur: ${error.message || 'Erreur inconnue'}`);
		}
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setSelectedUser(null);
		form.resetFields();
	};

	const Footer = () => {
		return (
			<StatsContainer>
				<StatItem>
					<UserOutlined style={{ color: '#9191fa' }} />
					Total : <span>{stats.total}</span>
				</StatItem>
				<StatItem>
					Responsables : <span>{stats.responsable}</span>
				</StatItem>
				<StatItem>
					Managers : <span>{stats.manager}</span>
				</StatItem>
				<StatItem>
					Employés : <span>{stats.employer}</span>
				</StatItem>
			</StatsContainer>
		);
	};

	return (
		<PageWrapper>
			<Header>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", path: "/" },
						{ label: "Effectif" },
					]}
				/>
				<h1>Effectif de l'entreprise</h1>
				<ToolbarContainer>
					<LeftActions>
						<SearchContainer>
							<Input
								prefix={<SearchOutlined style={{ color: '#64748b' }} />}
								placeholder="Rechercher un membre..."
								onChange={handleSearch}
								allowClear
							/>
						</SearchContainer>
					</LeftActions>
				</ToolbarContainer>
				<FilterContainer>
					<div className="filter-label">
						<FilterOutlined />
						Filtres :
					</div>
					<Select
						placeholder="Sélectionner un rôle"
						options={roleOptions}
						onChange={handleRoleChange}
						value={selectedRole}
						allowClear
					/>
					<Select
						placeholder="Sélectionner une équipe"
						options={teamOptions}
						onChange={handleTeamChange}
						value={selectedTeam}
						showSearch
						allowClear
						filterOption={(input, option) =>
							(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
						}
					/>
				</FilterContainer>
			</Header>
			<ScrollableContent>
				{/* Modal Modification */}
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
							Modifier l'utilisateur
						</span>
					}
					open={isEditModalOpen}
					onCancel={handleCloseEditModal}
					footer={null}
					width={600}
				>
					<Form
						form={form}
						layout="vertical"
						onFinish={handleEditSubmit}
					>
						<Form.Item
							label="Prénom"
							name="firstName"
							rules={[{ required: true, message: 'Le prénom est requis' }]}
						>
							<Input placeholder="Prénom" />
						</Form.Item>
						<Form.Item
							label="Nom"
							name="lastName"
							rules={[{ required: true, message: 'Le nom est requis' }]}
						>
							<Input placeholder="Nom" />
						</Form.Item>
						<Form.Item
							label="Email"
							name="email"
							rules={[
								{ required: true, message: 'L\'email est requis' },
								{ type: 'email', message: 'L\'email n\'est pas valide' }
							]}
						>
							<Input placeholder="Email" />
						</Form.Item>
						<Form.Item
							label="Téléphone"
							name="phoneNumber"
							rules={[{ required: true, message: 'Le téléphone est requis' }]}
						>
							<Input placeholder="Téléphone" />
						</Form.Item>
						<Form.Item
							label="Type de contrat"
							name="contractType"
							rules={[{ required: true, message: 'Le type de contrat est requis' }]}
						>
							<Select placeholder="Sélectionner un type de contrat">
								<Select.Option value="H15">15h/semaine</Select.Option>
								<Select.Option value="H35">35h/semaine</Select.Option>
								<Select.Option value="H40">40h/semaine</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							label="Rôle"
							name="role"
							rules={[{ required: true, message: 'Le rôle est requis' }]}
						>
							<Select placeholder="Sélectionner un rôle">
								<Select.Option value="Employer">Employé</Select.Option>
								<Select.Option value="Manager">Manager</Select.Option>
								<Select.Option value="Responsable">Responsable</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							label="Équipe(s)"
							name="teams"
						>
							<Select
								mode="multiple"
								placeholder="Sélectionner une ou plusieurs équipes"
								options={teamsData?.map(team => ({
									label: team.teamName,
									value: team.id,
								})) || []}
								showSearch
								filterOption={(input, option) =>
									(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
								}
							/>
						</Form.Item>
						<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
							<ButtonStyle 
								style={{ marginRight: 8 }}
								onClick={handleCloseEditModal}
							>
								Annuler
							</ButtonStyle>
							<ButtonStyle 
								type="primary" 
								htmlType="submit"
								loading={loadingUpdateUser}
							>
								Enregistrer
							</ButtonStyle>
						</Form.Item>
					</Form>
				</Modal>

				<div style={{ margin: "24px 0" }}>
					<TableStyle 
						columns={columnsEffectif(handleDetail, handleEdit, handleDelete, loadingDeleteUser)} 
						dataSource={filteredUsers}
						rowKey="id"
						pagination={{
							defaultPageSize: 20,
							pageSizeOptions: [10, 20, 50, 100],
							showSizeChanger: true,
							showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} membres`,
						}}
						onChange={handleTableChange}
						footer={() => <Footer />}
						scroll={{ x: 1350, y: 450 }}
					/>
				</div>
			</ScrollableContent>
		</PageWrapper>
	);
};

